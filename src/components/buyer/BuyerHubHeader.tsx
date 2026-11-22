import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";

type Stat = {
  href?: string;
  label: string;
  value: string | number;
  active?: boolean;
};

type Props = {
  locale: Locale;
  title: string;
  lead?: string;
  actions?: ReactNode;
  stats?: Stat[];
};

/** Emerald hub hero shared by buyer subpages (seller zip pattern). */
export function BuyerHubHeader({ locale, title, lead, actions, stats }: Props) {
  const isAr = locale === "ar";
  return (
    <header className={`ib-hero${stats?.length ? " ib-hero--split" : ""}`} dir={isAr ? "rtl" : "ltr"}>
      <div className="ib-hero__intro">
        <h1 className="ib-hero__title">{title}</h1>
        {lead ? <p className="ib-hero__lead">{lead}</p> : null}
        {actions ? <div className="ib-hero__actions" style={{ marginTop: "0.9rem" }}>{actions}</div> : null}
      </div>
      {stats?.length ? (
        <div className="ib-hero__aside">
          <div className="ib-hero__stats" style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, minmax(0, 1fr))` }}>
            {stats.map((s) => {
              const className = `ib-hero__stat${s.active ? " is-active" : ""}`;
              const body = (
                <>
                  <span className="ib-hero__stat-value">{s.value}</span>
                  <span className="ib-hero__stat-label">{s.label}</span>
                </>
              );
              return s.href ? (
                <Link key={s.label} href={s.href} className={className} aria-current={s.active ? "page" : undefined}>
                  {body}
                </Link>
              ) : (
                <div key={s.label} className={className}>
                  {body}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}
