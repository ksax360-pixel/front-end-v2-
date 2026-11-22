// Buyer home — one next action, actionable pulse, active requests only (no CTA duplicates).

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ClipboardList,
  Crown,
  FileSpreadsheet,
  Hourglass,
  MessageSquareQuote,
  Plus,
  Search,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { BuyerRequestRow, RequestStage } from "@/lib/buyer-requests";
import { formatMoney, unitLabel } from "@/lib/money";
import { cityName } from "@/lib/cities";
import { BuyerWelcomeCard } from "@/components/buyer/BuyerWelcomeCard";
import { BuyerNotificationsPanel } from "@/components/buyer/BuyerNotificationsPanel";

type Props = {
  locale: Locale;
  name: string;
  rows: BuyerRequestRow[];
};

const STAGES: RequestStage[] = ["finding", "waiting", "compare", "chosen"];
const HOME_LIMIT = 5;

export function BuyerRequestsHome({ locale, name, rows }: Props) {
  const isAr = locale === "ar";
  const L = (en: string, ar: string): string => (isAr ? ar : en);
  const date = (iso?: string): string =>
    iso
      ? new Date(iso).toLocaleDateString(isAr ? "ar-SA-u-nu-latn" : "en-GB", {
          day: "numeric",
          month: "short",
        })
      : "";

  const stageLabel = (r: BuyerRequestRow): string => {
    switch (r.stage) {
      case "finding":
        return L("Finding suppliers", "نبحث عن موردين");
      case "waiting":
        return L(
          `Waiting · ${r.reached} supplier${r.reached === 1 ? "" : "s"}`,
          `بانتظار العروض · ${r.reached} مورد`,
        );
      case "compare":
        return L(
          `${r.quotes} quote${r.quotes === 1 ? "" : "s"} ready`,
          `${r.quotes} ${r.quotes === 1 ? "عرض جاهز" : "عروض جاهزة"}`,
        );
      case "chosen":
        return L("Supplier chosen", "تم اختيار المورد");
      default:
        return L("Closed", "مغلق");
    }
  };

  const titleOf = (r: BuyerRequestRow): string =>
    r.items.length > 1
      ? L(`${r.title} + ${r.items.length - 1} more`, `${r.title} + ${r.items.length - 1} أخرى`)
      : r.title;

  const quotesHref = (r: BuyerRequestRow): string =>
    `/${locale}/buyer/quotations?${new URLSearchParams({ rfq: r.id, title: titleOf(r) })}`;
  const detailHref = (r: BuyerRequestRow): string => `/${locale}/buyer/rfqs?id=${r.id}`;

  const needsDecision = rows.filter((r) => r.stage === "compare");
  const waiting = rows.filter((r) => r.stage === "waiting");
  const finding = rows.filter((r) => r.stage === "finding");
  const active = rows.filter((r) => r.stage !== "closed" && r.stage !== "chosen");
  const homeRows = active.slice(0, HOME_LIMIT);
  const quotesReady = needsDecision.reduce((n, r) => n + Math.max(r.newQuotes || r.quotes, 0), 0);
  const topDecision = needsDecision[0];

  const pulse = [
    {
      href: topDecision ? quotesHref(topDecision) : `/${locale}/buyer/quotations`,
      label: L("Quotes ready", "عروض جاهزة"),
      value: quotesReady,
      icon: MessageSquareQuote,
      hot: quotesReady > 0,
    },
    {
      href: `/${locale}/buyer/rfqs`,
      label: L("Waiting on suppliers", "بانتظار الموردين"),
      value: waiting.length,
      icon: Hourglass,
      hot: false,
    },
    {
      href: `/${locale}/buyer/rfqs`,
      label: L("Being matched", "قيد المطابقة"),
      value: finding.length,
      icon: Search,
      hot: false,
    },
    {
      href: `/${locale}/buyer/rfqs`,
      label: L("Open requests", "طلبات مفتوحة"),
      value: active.length,
      icon: ClipboardList,
      hot: false,
    },
  ] as const;

  const welcomeHint = topDecision
    ? L(
        `${quotesReady} new quote${quotesReady === 1 ? "" : "s"} on “${titleOf(topDecision)}” — compare and pick a supplier.`,
        `${quotesReady} ${quotesReady === 1 ? "عرض جديد" : "عروض جديدة"} على «${titleOf(topDecision)}» — قارن واختر مورداً.`,
      )
    : undefined;

  return (
    <div className="bh sd-page" dir={isAr ? "rtl" : "ltr"}>
      <section className="bh-metrics" aria-label={L("Request pulse", "نبض الطلبات")}>
        {pulse.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.label}
              href={m.href}
              className={`bh-metric${m.hot ? " is-hot" : ""}`}
            >
              <div className="bh-metric__copy">
                <p className="bh-metric__label">{m.label}</p>
                <p className="bh-metric__value">{m.value}</p>
              </div>
              <span className="bh-metric__icon" aria-hidden>
                <Icon size={17} strokeWidth={1.6} />
              </span>
            </Link>
          );
        })}
      </section>

      <section className="bh-overview" aria-label={L("Overview", "نظرة عامة")}>
        <BuyerWelcomeCard
          locale={locale}
          displayName={name}
          hint={welcomeHint}
          ctaHref={topDecision ? quotesHref(topDecision) : undefined}
          ctaLabel={topDecision ? L("Compare quotes", "قارن العروض") : undefined}
        />
        <BuyerNotificationsPanel locale={locale} />
      </section>

      <div className="bh-body">
        <section className="sd-surface sd-surface--pad bh-list" aria-labelledby="bh-list-h">
          <div className="sd-panelhead">
            <h2 id="bh-list-h" className="sd-panelhead__title">
              {L("Active requests", "الطلبات النشطة")}
            </h2>
            {active.length ? (
              <Link href={`/${locale}/buyer/rfqs`} className="sd-panelhead__action bh-btn bh-btn--sm">
                {L("See all", "عرض الكل")}
                <ArrowRight size={14} aria-hidden />
              </Link>
            ) : null}
          </div>

          {homeRows.length ? (
            <ul className="bh-list__ul">
              {homeRows.map((r) => {
                const at = STAGES.indexOf(r.stage);
                return (
                  <li key={r.id} className={`bh-row is-${r.stage}`}>
                    <div className="bh-row__main">
                      <Link href={detailHref(r)} className="bh-row__title">
                        {titleOf(r)}
                      </Link>
                      <p className="bh-row__meta">
                        {r.items[0]?.quantity ? (
                          <span>
                            {r.items[0].quantity.toLocaleString("en-US")}{" "}
                            {unitLabel(r.items[0].unit, locale)}
                          </span>
                        ) : null}
                        {r.city ? <span>{cityName(r.city, locale)}</span> : null}
                        <span>{L(`Sent ${date(r.createdAt)}`, `أُرسل ${date(r.createdAt)}`)}</span>
                        {r.neededBy ? (
                          <span>
                            {L(`Needed by ${date(r.neededBy)}`, `مطلوب قبل ${date(r.neededBy)}`)}
                          </span>
                        ) : null}
                      </p>
                      <div className="bh-track" aria-label={stageLabel(r)}>
                        {STAGES.map((s, i) => (
                          <i key={s} className={i <= at ? "is-on" : ""} />
                        ))}
                        <span>{stageLabel(r)}</span>
                      </div>
                    </div>
                    <div className="bh-row__side">
                      {r.bestTotal != null ? (
                        <p className="bh-row__best">
                          <small>{L("Best quote", "أفضل عرض")}</small>
                          <b>{formatMoney(r.bestTotal, locale, r.currency)}</b>
                        </p>
                      ) : null}
                      {r.stage === "compare" ? (
                        <Link href={quotesHref(r)} className="bh-btn bh-btn--primary bh-btn--sm">
                          {L("Compare", "قارن")}
                        </Link>
                      ) : (
                        <Link href={detailHref(r)} className="bh-btn bh-btn--sm">
                          {L("Open", "افتح")}
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="bh-empty">
              <p>
                {L(
                  "No open requests yet. Tell Hukum what you need — or upload a BOQ for multi-line jobs.",
                  "ما فيه طلبات مفتوحة. قل لحكم وش تحتاج — أو ارفع جدول كميات للطلبات متعددة البنود.",
                )}
              </p>
              <div className="bh-empty__ways">
                <Link href={`/${locale}/buyer/rfqs/new`} className="is-primary">
                  <Plus size={16} aria-hidden /> {L("New request", "طلب جديد")}
                </Link>
                <Link href={`/${locale}/upload-boq`}>
                  <FileSpreadsheet size={16} aria-hidden /> {L("Upload a BOQ", "ارفع جدول كميات")}
                </Link>
              </div>
            </div>
          )}
        </section>

        <aside className="bh-side">
          <article className="bh-vip">
            <span className="bh-vip__icon" aria-hidden>
              <Crown size={18} strokeWidth={1.7} />
            </span>
            <h2 className="bh-vip__title">{L("VIP concierge", "كونسيرج VIP")}</h2>
            <p className="bh-vip__lead">
              {L(
                "Large, complex or urgent? A Hukum manager sources it with you, end to end.",
                "طلب كبير أو معقّد أو مستعجل؟ مدير من حكم يتولاه معك من البداية للنهاية.",
              )}
            </p>
            <Link href={`/${locale}/sourcing-help`} className="bh-vip__cta">
              {L("Request VIP concierge", "اطلب كونسيرج VIP")}
              <ArrowUpRight size={15} aria-hidden />
            </Link>
          </article>
        </aside>
      </div>
    </div>
  );
}
