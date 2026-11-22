"use client";

// Buyer (and shared) auth frame — matches seller sign-in: white form + forest-green panel.
// Mobile: full-bleed panel art with the form overlaid. Desktop: approved split-screen.

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const LOCKUP_SRC = "/brand/hukum-calligraphy.png";
const LOCKUP_ASPECT = 301 / 183;
const PANEL_BG = "/brand/buyer-auth-clipboard.jpg";

type Audience = "buyer" | "supplier" | "admin";

export function AuthShell({
  children,
  wide = false,
  locale = "en",
  audience,
}: {
  children: ReactNode;
  wide?: boolean;
  locale?: string;
  audience?: Audience;
}) {
  const isAr = locale === "ar";
  const L = (en: string, ar: string): string => (isAr ? ar : en);
  const [detected, setDetected] = useState<Audience>("buyer");
  const [altHref, setAltHref] = useState(`/${isAr ? "en" : "ar"}`);
  const logoH = 56;
  const logoW = Math.round(logoH * LOCKUP_ASPECT);

  useEffect(() => {
    const root = document.documentElement;
    const prevTheme = root.getAttribute("data-theme");
    const prevScheme = root.style.colorScheme;
    root.setAttribute("data-theme", "light");
    root.classList.add("kt-public");
    root.style.colorScheme = "light";

    const { pathname, search } = window.location;
    const next = new URLSearchParams(search).get("next") || "";
    setDetected(/\/admin(\/|$)/.test(next) ? "admin" : /\/vendor(\/|$)/.test(next) ? "supplier" : "buyer");
    setAltHref(pathname.replace(/^\/(en|ar)/, `/${isAr ? "en" : "ar"}`) + search);

    return () => {
      if (prevTheme) root.setAttribute("data-theme", prevTheme);
      else root.removeAttribute("data-theme");
      root.style.colorScheme = prevScheme;
    };
  }, [isAr]);

  const who = audience || detected;
  const panelLabel =
    who === "supplier"
      ? L("Supplier workspace", "مساحة المورد")
      : who === "admin"
        ? L("Hukum team", "فريق حكم")
        : L("Buyer workspace", "مساحة المشتري");

  return (
    <div className={`auth-shell${wide ? " is-wide" : ""}`} dir={isAr ? "rtl" : "ltr"}>
      <div className="auth-shell__lang-dock" dir="ltr">
        <div className="auth-shell__lang-switch" role="group" aria-label={L("Language", "اللغة")}>
          {isAr ? (
            <Link href={altHref} hrefLang="en" className="auth-shell__lang-opt" aria-label="English" replace>
              EN
            </Link>
          ) : (
            <span className="auth-shell__lang-opt is-active" aria-current="true">
              EN
            </span>
          )}
          {isAr ? (
            <span className="auth-shell__lang-opt is-active" aria-current="true" lang="ar">
              ع
            </span>
          ) : (
            <Link href={altHref} hrefLang="ar" className="auth-shell__lang-opt" aria-label="العربية" lang="ar" replace>
              ع
            </Link>
          )}
        </div>
      </div>

      <div className="auth-shell__body" dir="ltr">
        <main className="auth-shell__side" dir={isAr ? "rtl" : "ltr"}>
          <div className="auth-shell__chrome auth-shell__chrome--form" dir="ltr">
            <Link
              href={`/${locale}`}
              className="auth-shell__back"
              aria-label={L("Back to Hukum", "رجوع إلى حكم")}
            >
              <ChevronLeft className="auth-shell__back-icon" size={20} strokeWidth={1.75} aria-hidden />
              <span>{L("Back", "رجوع")}</span>
            </Link>
          </div>

          <div className="auth-shell__form">{children}</div>

          <footer className="auth-shell__foot">
            <Link href={`/${locale}/privacy`}>{L("Privacy", "الخصوصية")}</Link>
            <Link href={`/${locale}/terms`}>{L("Terms", "الشروط")}</Link>
            <Link href={`/${locale}/help`}>{L("Help", "المساعدة")}</Link>
          </footer>
        </main>

        <aside className={`auth-shell__panel is-${who}`} aria-label={panelLabel}>
          <Image
            src={PANEL_BG}
            alt=""
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="auth-shell__panel-bg"
          />
          <div className="auth-shell__panel-glow" aria-hidden />
          <div className="auth-shell__panel-inner">
            <div className="auth-shell__brand">
              <Image
                src={LOCKUP_SRC}
                alt="Hukum"
                width={logoW}
                height={logoH}
                className="auth-shell__logo"
                priority
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
