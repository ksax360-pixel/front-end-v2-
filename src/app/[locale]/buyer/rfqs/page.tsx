import Link from "next/link";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Check, MapPin } from "lucide-react";
import { isLocale, type Locale } from "@/i18n/config";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BuyerHubHeader } from "@/components/buyer/BuyerHubHeader";
import { BuyerRequestTabs } from "@/components/buyer/BuyerRequestTabs";
import { CloseRequestButton } from "@/components/buyer/CloseRequestButton";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { BUYER_NAV } from "@/lib/buyer-nav";
import { QuotationInbox } from "@/components/inbox/QuotationInbox";
import { loadBuyerRequests, type BuyerRequestRow, type RequestStage } from "@/lib/buyer-requests";
import { formatMoney, unitLabel } from "@/lib/money";
import { cityName } from "@/lib/cities";
import { RFQ } from "@/modules/rfqs/rfq.model";

type StatusTab = "active" | "chosen" | "closed";
type Tab = StatusTab | "messages";
const TAB_OF: Record<RequestStage, StatusTab> = {
  finding: "active",
  waiting: "active",
  compare: "active",
  chosen: "chosen",
  closed: "closed",
};
type Detail = {
  description?: string; additional?: string; deadline?: string;
  items: Array<{ name: string; quantity?: number; unit?: string; spec?: string }>;
};

/** Buyer requests: every request and where it stands, with the selected one open beside the list. */
export default async function BuyerRfqsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  setRequestLocale(locale);
  const sp = await searchParams;
  const isAr = locale === "ar";
  const L = (en: string, ar: string): string => (isAr ? ar : en);

  const session = await getSession();
  if (!session?.id) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/buyer/rfqs`)}`);

  let rows: BuyerRequestRow[] = [];
  let detail: Detail | null = null;
  const selected = sp.id && /^[a-f\d]{24}$/i.test(sp.id) ? sp.id : "";
  try {
    await connectDB();
    rows = await loadBuyerRequests(session.id, locale, 100);
    if (selected) {
      const r = (await RFQ.findOne({ _id: selected, buyerId: session.id }).select("description additionalRequirements deadline items").lean()) as {
        description?: { en?: string; ar?: string } | string; additionalRequirements?: string; deadline?: Date;
        items?: Array<{ name?: { en?: string; ar?: string }; quantity?: number; unit?: string; specifications?: string }>;
      } | null;
      if (r) {
        const d = typeof r.description === "string" ? r.description : (isAr ? r.description?.ar || r.description?.en : r.description?.en || r.description?.ar);
        detail = {
          description: d || "",
          additional: r.additionalRequirements || "",
          deadline: r.deadline ? new Date(r.deadline).toISOString() : undefined,
          items: (r.items || []).map((it) => ({ name: (isAr ? it.name?.ar || it.name?.en : it.name?.en || it.name?.ar) || "", quantity: it.quantity, unit: it.unit, spec: it.specifications })),
        };
      }
    }
  } catch (e) {
    console.error("[buyer/rfqs]", e);
  }

  const sel = rows.find((r) => r.id === selected);
  const tab: Tab =
    sp.tab === "messages" || sp.tab === "chosen" || sp.tab === "closed"
      ? sp.tab
      : sel
        ? TAB_OF[sel.stage]
        : "active";
  const isMessages = tab === "messages";
  const counts: Record<StatusTab, number> = { active: 0, chosen: 0, closed: 0 };
  for (const r of rows) counts[TAB_OF[r.stage]]++;
  const shown = isMessages ? [] : rows.filter((r) => TAB_OF[r.stage] === tab);
  const date = (iso?: string): string =>
    iso
      ? new Date(iso).toLocaleDateString(isAr ? "ar-SA-u-nu-latn" : "en-GB", {
          day: "numeric",
          month: "short",
        })
      : "";
  const titleOf = (r: BuyerRequestRow): string =>
    r.items.length > 1
      ? L(`${r.title} + ${r.items.length - 1} more`, `${r.title} + ${r.items.length - 1} أخرى`)
      : r.title;
  const quotesHref = (r: BuyerRequestRow): string =>
    `/${locale}/buyer/quotations?${new URLSearchParams({ rfq: r.id, title: titleOf(r) })}`;
  const stageText: Record<RequestStage, string> = {
    finding: L("Finding suppliers", "نبحث عن موردين"),
    waiting: L("Waiting for quotes", "بانتظار العروض"),
    compare: L("Quotes to compare", "عروض للمقارنة"),
    chosen: L("Supplier chosen", "تم اختيار مورد"),
    closed: L("Closed", "مغلق"),
  };
  const chip: Record<RequestStage, string> = {
    finding: "opened",
    waiting: "opened",
    compare: "new",
    chosen: "won",
    closed: "lost",
  };
  const statusTabs: Array<{ k: StatusTab; label: string }> = [
    { k: "active", label: L("Active", "نشطة") },
    { k: "chosen", label: L("Chosen", "تم الاختيار") },
    { k: "closed", label: L("Closed", "مغلقة") },
  ];
  // Visible progress for the open request: sent → reached suppliers → quotes in → chosen.
  const steps = sel
    ? [
        { done: true, label: L(`Sent ${date(sel.createdAt)}`, `أُرسل ${date(sel.createdAt)}`) },
        {
          done: sel.reached > 0,
          label: sel.reached
            ? L(`Reached ${sel.reached} supplier${sel.reached === 1 ? "" : "s"}`, `وصل لـ ${sel.reached} مورد`)
            : L("Matching suppliers", "نطابق الموردين"),
        },
        {
          done: sel.quotes > 0,
          label: sel.quotes
            ? L(`${sel.quotes} quote${sel.quotes === 1 ? "" : "s"} in`, `${sel.quotes} عرض وصل`)
            : L("Quotes on the way", "العروض في الطريق"),
        },
        {
          done: sel.stage === "chosen",
          label:
            sel.stage === "chosen"
              ? L("Supplier chosen", "تم اختيار المورد")
              : L("You choose", "أنت تختار"),
        },
      ]
    : [];

  return (
    <DashboardShell locale={locale} title="Buyer" nav={[...BUYER_NAV]} allowDark={false}>
      <div
        className={`bh sd-page ib-hub vrq brq${selected && !isMessages ? " has-detail" : ""}`}
        dir={isAr ? "rtl" : "ltr"}
      >
        <BuyerHubHeader
          locale={locale}
          title={isMessages ? L("Messages", "الرسائل") : L("Requests", "الطلبات")}
          lead={
            isMessages
              ? L(
                  "Conversations about your requests and quotes. First contact goes through Hukum.",
                  "محادثاتك حول الطلبات والعروض. أول تواصل يمر عبر حكم.",
                )
              : L(
                  "Everything you've asked suppliers for, and where each request stands.",
                  "كل اللي طلبته من الموردين، ووين وصل كل طلب.",
                )
          }
          stats={statusTabs.map((t) => ({
            href: `/${locale}/buyer/rfqs?tab=${t.k}`,
            label: t.label,
            value: counts[t.k],
            active: tab === t.k,
          }))}
        />

        <div className="vrq-folder">
        <BuyerRequestTabs
          locale={locale}
          active={isMessages ? "messages" : tab}
          counts={counts}
        />

        <div className="vrq-body">
          {isMessages ? (
            <section className="brq-messages" aria-label={L("Messages", "الرسائل")}>
              <QuotationInbox locale={locale} role="buyer" linkBase={`/${locale}`} />
            </section>
          ) : (
            <>
              <section className="vrq-list" aria-label={L("Requests", "الطلبات")}>
                {shown.length ? (
                  <ul>
                    {shown.map((r) => (
                      <li key={r.id}>
                        <Link
                          href={`/${locale}/buyer/rfqs?tab=${tab}&id=${r.id}`}
                          className={`vrq-item${selected === r.id ? " is-on" : ""}`}
                          aria-current={selected === r.id ? "true" : undefined}
                        >
                          <span className="vrq-item__top">
                            <b>{titleOf(r)}</b>
                            <span className={`vrq-chip is-${chip[r.stage]}`}>
                              {r.stage === "compare" && r.newQuotes
                                ? L(`${r.newQuotes} new`, `${r.newQuotes} جديد`)
                                : stageText[r.stage]}
                            </span>
                          </span>
                          <span className="vrq-item__meta">
                            {r.items[0]?.quantity ? (
                              <span>
                                {r.items[0].quantity.toLocaleString("en-US")}{" "}
                                {unitLabel(r.items[0].unit, locale)}
                              </span>
                            ) : null}
                            {r.city ? <span>{cityName(r.city, locale)}</span> : null}
                            <span>{date(r.createdAt)}</span>
                            {r.quotes ? (
                              <span>
                                {L(
                                  `${r.quotes} quote${r.quotes === 1 ? "" : "s"}`,
                                  `${r.quotes} عروض`,
                                )}
                              </span>
                            ) : null}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="pdp2-empty vrq-empty">
                    {tab === "active"
                      ? L("No active requests.", "ما فيه طلبات نشطة.")
                      : L("Nothing here yet.", "ما فيه شي هنا بعد.")}{" "}
                    <Link href={`/${locale}/buyer/rfqs/new`}>
                      {L("Ask suppliers for a price", "اطلب سعر من الموردين")}
                    </Link>
                  </p>
                )}
              </section>

              <section className="vrq-detail" aria-label={L("Request details", "تفاصيل الطلب")}>
                {sel && detail ? (
                  <div className="qb brq-d">
                    <Link href={`/${locale}/buyer/rfqs?tab=${tab}`} className="qb-back">
                      {L("All requests", "كل الطلبات")}
                    </Link>
                    <div className="qb-head">
                      <h2>{titleOf(sel)}</h2>
                      <p className="qb-meta">
                        {sel.city ? (
                          <span>
                            <MapPin size={14} aria-hidden />{" "}
                            {L(
                              `Deliver to ${cityName(sel.city, locale)}`,
                              `التوصيل إلى ${cityName(sel.city, locale)}`,
                            )}
                          </span>
                        ) : null}
                        {sel.neededBy ? (
                          <span>
                            {L(`Needed by ${date(sel.neededBy)}`, `مطلوب قبل ${date(sel.neededBy)}`)}
                          </span>
                        ) : null}
                        {detail.deadline ? (
                          <span>
                            {L(
                              `Quotes close ${date(detail.deadline)}`,
                              `العروض تقفل ${date(detail.deadline)}`,
                            )}
                          </span>
                        ) : null}
                      </p>
                    </div>

                    <ol className="brq-steps" aria-label={L("Progress", "التقدم")}>
                      {steps.map((s, i) => (
                        <li key={i} className={s.done ? "is-done" : ""}>
                          <span>{s.done ? <Check size={13} aria-hidden /> : i + 1}</span>
                          {s.label}
                        </li>
                      ))}
                    </ol>

                    {sel.quotes ? (
                      <div className="brq-cta">
                        <div>
                          <b>
                            {L(
                              `${sel.quotes} quote${sel.quotes === 1 ? "" : "s"} to compare`,
                              `${sel.quotes} عروض للمقارنة`,
                            )}
                          </b>
                          {sel.bestTotal != null ? (
                            <span>
                              {L("Lowest total", "أقل إجمالي")} {formatMoney(sel.bestTotal, locale)}
                            </span>
                          ) : null}
                        </div>
                        <Link href={quotesHref(sel)} className="qb-send">
                          {L("Compare quotes", "قارن العروض")}
                        </Link>
                      </div>
                    ) : sel.stage !== "closed" ? (
                      <p className="brq-wait">
                        {L(
                          "Suppliers are pricing your request. Quotes show here as they arrive, and we'll email you.",
                          "الموردون يسعّرون طلبك. العروض تظهر هنا أول ما توصل، وبنرسل لك إيميل.",
                        )}
                      </p>
                    ) : null}

                    <div className="qb-lines">
                      <div className="qb-line qb-line--head brq-line">
                        <span>{L("Item", "البند")}</span>
                        <span>{L("Quantity", "الكمية")}</span>
                      </div>
                      {detail.items.map((it, i) => (
                        <div key={i} className="qb-line brq-line">
                          <span className="qb-item">
                            <b>{it.name}</b>
                            {it.spec ? <small>{it.spec}</small> : null}
                          </span>
                          <span className="qb-num">
                            {it.quantity
                              ? `${it.quantity.toLocaleString("en-US")} ${unitLabel(it.unit, locale)}`
                              : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                    {detail.description ? <p className="qb-desc">{detail.description}</p> : null}

                    {sel.stage !== "closed" && sel.stage !== "chosen" ? (
                      <div className="qb-act">
                        <CloseRequestButton locale={locale} id={sel.id} />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="vrq-pick">
                    {shown.length
                      ? L(
                          "Pick a request to see its details and quotes.",
                          "اختر طلباً لتشوف تفاصيله وعروضه.",
                        )
                      : ""}
                  </p>
                )}
              </section>
            </>
          )}
        </div>
        </div>
      </div>
    </DashboardShell>
  );
}
