"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { GahwaPour } from "@/components/buyer/GahwaPour";

type Props = {
  locale: Locale;
  displayName: string;
  ctaHref?: string;
  ctaLabel?: string;
  /** One-line next-step context under the greeting */
  hint?: string;
};

type DayPeriod = "morning" | "afternoon" | "evening";

const SAUDI_TZ = "Asia/Riyadh";

function formatDisplayName(value: string, isAr: boolean): string {
  const trimmed = value.trim();
  if (!trimmed) return isAr ? "المشتري" : "Buyer";
  // Arabic has no case — don't run Latin title-case on Arabic names
  if (isAr || /[\u0600-\u06FF]/.test(trimmed)) return trimmed;
  return trimmed
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Wall-clock hour in Saudi Arabia (Asia/Riyadh), 0–23. */
function getSaudiHour(date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SAUDI_TZ,
    hour: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const raw = parts.find((p) => p.type === "hour")?.value ?? "0";
  // Some engines emit "24" for midnight
  return Number(raw) % 24;
}

function periodForSaudiHour(hour: number): DayPeriod {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function greetingForPeriod(period: DayPeriod, isAr: boolean): string {
  if (isAr) {
    if (period === "morning") return "صباح الخير،";
    if (period === "afternoon") return "طاب يومك،";
    return "مساء الخير،";
  }
  if (period === "morning") return "Good morning,";
  if (period === "afternoon") return "Good afternoon,";
  return "Good evening,";
}

export function BuyerWelcomeCard({ locale, displayName, ctaHref, ctaLabel, hint }: Props) {
  const isAr = locale === "ar";
  const [period, setPeriod] = useState<DayPeriod>(() => periodForSaudiHour(getSaudiHour()));

  useEffect(() => {
    const sync = () => setPeriod(periodForSaudiHour(getSaudiHour()));
    sync();
    const id = window.setInterval(sync, 60_000);
    const onFocus = () => sync();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const name = formatDisplayName(displayName || "", isAr);
  const greeting = greetingForPeriod(period, isAr);
  const gahwaVariant = period === "evening" ? "night" : "day";

  return (
    <section className="bh-welcome" aria-label={isAr ? "ترحيب" : "Welcome"} dir={isAr ? "rtl" : "ltr"}>
      <div className="bh-welcome__glow" aria-hidden />
      <div className="bh-welcome__body">
        <div className="bh-welcome__copy">
          <p className="bh-welcome__eyebrow">
            <span className="bh-welcome__eyebrow-line" aria-hidden />
            {greeting}
          </p>
          <h1 className="bh-welcome__name">{name}</h1>
          <p className="bh-welcome__dua" lang="ar" dir="rtl">
            حياك الله
          </p>
          {hint ? <p className="bh-welcome__hint">{hint}</p> : null}
          {ctaHref && ctaLabel ? (
            <div className="bh-welcome__actions">
              <Link href={ctaHref} className="bh-welcome__cta">
                {ctaLabel}
                <ArrowRight size={14} strokeWidth={1.75} className="bh-welcome__cta-arrow" aria-hidden />
              </Link>
            </div>
          ) : null}
        </div>
        <div className="bh-welcome__art" aria-hidden>
          <GahwaPour size={168} variant={gahwaVariant} />
        </div>
      </div>
    </section>
  );
}
