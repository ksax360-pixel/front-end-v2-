import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { isLocale, type Locale } from "@/i18n/config";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BuyerHubHeader } from "@/components/buyer/BuyerHubHeader";
import { BuyerRequestTabs } from "@/components/buyer/BuyerRequestTabs";
import { RfqFormPage } from "@/components/rfq/RfqForm";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/modules/users/user.model";
import { Buyer } from "@/modules/organizations/organization.model";
import { BUYER_NAV } from "@/lib/buyer-nav";
import { loadBuyerRequests, type RequestStage } from "@/lib/buyer-requests";

const TAB_OF: Record<RequestStage, "active" | "chosen" | "closed"> = {
  finding: "active",
  waiting: "active",
  compare: "active",
  chosen: "chosen",
  closed: "closed",
};

export default async function BuyerNewRequestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  setRequestLocale(locale);
  const isAr = locale === "ar";
  const L = (en: string, ar: string) => (isAr ? ar : en);

  const session = await getSession();
  if (!session?.id) {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/buyer/rfqs/new`)}`);
  }

  let contact = {
    name: "",
    company: "",
    phone: "",
    email: session.email || "",
  };
  const counts = { active: 0, chosen: 0, closed: 0 };

  try {
    await connectDB();
    const [user, buyer, rows] = await Promise.all([
      User.findById(session.id).select("name email mobile").lean(),
      Buyer.findOne({ userId: session.id }).select("company city").lean(),
      loadBuyerRequests(session.id, locale, 100),
    ]);
    const u = user as { name?: string; email?: string; mobile?: string } | null;
    const b = buyer as { company?: string } | null;
    contact = {
      name: u?.name || session.email.split("@")[0] || "",
      company: b?.company || "",
      phone: u?.mobile || "",
      email: u?.email || session.email || "",
    };
    for (const r of rows) counts[TAB_OF[r.stage]]++;
  } catch {
    contact.name = session.email.split("@")[0] || "";
  }

  return (
    <DashboardShell locale={locale} title="Buyer" nav={[...BUYER_NAV]} allowDark={false}>
      <div className="bh sd-page ib-hub vrq brq" dir={isAr ? "rtl" : "ltr"}>
        <BuyerHubHeader
          locale={locale}
          title={L("New request", "طلب جديد")}
          lead={L(
            "Describe what you need. Matched suppliers send quotes to your Requests.",
            "صف وش تحتاج. الموردون المطابقون يرسلون العروض إلى طلباتك.",
          )}
          stats={[
            { href: `/${locale}/buyer/rfqs?tab=active`, label: L("Active", "نشطة"), value: counts.active },
            { href: `/${locale}/buyer/rfqs?tab=chosen`, label: L("Chosen", "تم الاختيار"), value: counts.chosen },
            { href: `/${locale}/buyer/rfqs?tab=closed`, label: L("Closed", "مغلقة"), value: counts.closed },
          ]}
        />
        <div className="vrq-folder">
          <BuyerRequestTabs locale={locale} active="new" counts={counts} />
          <div className="vrq-body bnr-panel">
            <RfqFormPage variant="buyer" initialContact={contact} showBuyerChrome={false} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
