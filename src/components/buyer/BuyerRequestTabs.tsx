import Link from "next/link";
import type { Locale } from "@/i18n/config";

export type BuyerRequestTabKey = "new" | "active" | "chosen" | "closed" | "messages";

type Tab = {
  key: BuyerRequestTabKey;
  label: string;
  href: string;
  count?: number;
};

type Props = {
  locale: Locale;
  active: BuyerRequestTabKey;
  counts?: Partial<Record<"active" | "chosen" | "closed", number>>;
};

/** Shared Requests strip: New · Active · Chosen · Closed · Messages */
export function BuyerRequestTabs({ locale, active, counts }: Props) {
  const isAr = locale === "ar";
  const L = (en: string, ar: string) => (isAr ? ar : en);
  const base = `/${locale}/buyer/rfqs`;

  const tabs: Tab[] = [
    { key: "new", label: L("New", "جديد"), href: `/${locale}/buyer/rfqs/new` },
    {
      key: "active",
      label: L("Active", "نشطة"),
      href: `${base}?tab=active`,
      count: counts?.active ?? 0,
    },
    {
      key: "chosen",
      label: L("Chosen", "تم الاختيار"),
      href: `${base}?tab=chosen`,
      count: counts?.chosen ?? 0,
    },
    {
      key: "closed",
      label: L("Closed", "مغلقة"),
      href: `${base}?tab=closed`,
      count: counts?.closed ?? 0,
    },
    { key: "messages", label: L("Messages", "الرسائل"), href: `${base}?tab=messages` },
  ];

  return (
    <nav className="vrq-tabs" aria-label={L("Request status", "حالة الطلب")}>
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={active === t.key ? "page" : undefined}
          className={active === t.key ? "is-on" : ""}
        >
          {t.label}
          {t.count != null ? <small>{t.count}</small> : null}
        </Link>
      ))}
    </nav>
  );
}
