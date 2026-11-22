"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { Locale } from "@/i18n/config";

type Loc = { en?: string; ar?: string } | string | undefined;

type Notif = {
  _id: string;
  type?: string;
  title?: Loc;
  body?: Loc;
  read?: boolean;
  createdAt?: string;
  meta?: { href?: string; rfqId?: string; quotationId?: string };
};

type Props = {
  locale: Locale;
};

function pickLoc(value: Loc, isAr: boolean): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return (isAr ? value.ar || value.en : value.en || value.ar) || "";
}

function typeLabel(type: string | undefined, isAr: boolean): string {
  const t = String(type || "").toLowerCase();
  if (t.includes("quote") || t.includes("quotation")) return isAr ? "عرض سعر" : "Quote";
  if (t.includes("message") || t.includes("chat")) return isAr ? "رسالة" : "Message";
  if (t.includes("rfq") || t.includes("request")) return isAr ? "طلب" : "Request";
  if (t.includes("remind")) return isAr ? "تذكير" : "Reminder";
  return isAr ? "تنبيه" : "Alert";
}

function hrefFor(n: Notif, locale: Locale): string {
  const raw = n.meta?.href?.trim();
  if (raw) {
    if (/^https?:\/\//i.test(raw)) return raw;
    const path = raw.replace(/^\/(en|ar)(?=\/)/, "");
    return path.startsWith("/") ? `/${locale}${path}` : `/${locale}/${path}`;
  }
  if (n.meta?.quotationId) return `/${locale}/buyer/quotations`;
  if (n.meta?.rfqId) return `/${locale}/buyer/rfqs?id=${n.meta.rfqId}`;
  const t = String(n.type || "").toLowerCase();
  if (t.includes("message")) return `/${locale}/buyer/rfqs?tab=messages`;
  if (t.includes("quote")) return `/${locale}/buyer/quotations`;
  return `/${locale}/buyer/rfqs`;
}

export function BuyerNotificationsPanel({ locale }: Props) {
  const isAr = locale === "ar";
  const L = (en: string, ar: string) => (isAr ? ar : en);
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/messages?resource=notifications");
        const json = await res.json();
        const rows = (json?.data || json?.items || []) as Notif[];
        if (!cancelled) setItems(Array.isArray(rows) ? rows.slice(0, 6) : []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);
  const date = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString(isAr ? "ar-SA-u-nu-latn" : "en-GB", {
          day: "numeric",
          month: "short",
        })
      : "";

  return (
    <div className="bh-snap sd-surface bh-notifs">
      <div className="bh-notifs__head">
        <p className="bh-snap__eyebrow">{L("Notifications", "التنبيهات")}</p>
        {unread ? (
          <span className="bh-notifs__count">
            {unread} {L("new", "جديدة")}
          </span>
        ) : null}
      </div>

      {loading ? (
        <p className="bh-notifs__empty">{L("Loading…", "جارٍ التحميل…")}</p>
      ) : items.length === 0 ? (
        <div className="bh-notifs__empty-state">
          <Bell size={18} strokeWidth={1.6} aria-hidden />
          <p>{L("No notifications yet", "ما فيه تنبيهات بعد")}</p>
          <span>
            {L(
              "New quotes and messages will show up here.",
              "العروض والرسائل الجديدة تظهر هنا.",
            )}
          </span>
        </div>
      ) : (
        <ul className="bh-notifs__list">
          {items.map((n) => {
            const title =
              pickLoc(n.title, isAr) || typeLabel(n.type, isAr);
            const body = pickLoc(n.body, isAr);
            return (
              <li key={n._id} className={`bh-notif${!n.read ? " is-unread" : ""}`}>
                <Link href={hrefFor(n, locale)} className="bh-notif__link">
                  <span className="bh-notif__icon" aria-hidden>
                    <Bell size={14} strokeWidth={1.7} />
                    {!n.read ? <i className="bh-notif__dot" /> : null}
                  </span>
                  <span className="bh-notif__copy">
                    <span className="bh-notif__top">
                      <span className="bh-notif__type">{typeLabel(n.type, isAr)}</span>
                      <time dateTime={n.createdAt}>{date(n.createdAt)}</time>
                    </span>
                    <span className="bh-notif__title">{title}</span>
                    {body ? <span className="bh-notif__body">{body}</span> : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Link href={`/${locale}/buyer/rfqs?tab=messages`} className="bh-notifs__all">
        {L("Open inbox", "افتح الوارد")}
      </Link>
    </div>
  );
}
