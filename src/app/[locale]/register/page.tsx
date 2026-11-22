"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthLuxField, AuthLuxStack } from "@/components/auth/AuthLuxField";
import { isLocale, type Locale } from "@/i18n/config";
import type { ApiBody } from "@/lib/api";
import { readAcquisition } from "@/lib/acquisition";
import { sellerIsExternal, sellerLoginUrl, sellerRegisterUrl } from "@/lib/seller-admin";

const SSO_ON = process.env.NEXT_PUBLIC_AUTH_SSO === "1";

type SessionUser = { roles?: string[] };

function dashboardPath(locale: Locale, roles: string[] = []) {
  if (roles.some((r) => ["admin", "super_admin"].includes(r))) return `/${locale}/admin`;
  if (roles.some((r) => r.startsWith("vendor"))) return `/${locale}/vendor/dashboard`;
  return `/${locale}/buyer/dashboard`;
}

function RegisterForm() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const raw = typeof params.locale === "string" ? params.locale : "en";
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const isAr = locale === "ar";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("+966");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleMobileChange(e: React.ChangeEvent<HTMLInputElement>) {
    let next = e.target.value.replace(/[^\d+]/g, "");
    if (!next.startsWith("+966")) {
      const digits = next.replace(/\D/g, "").replace(/^966/, "");
      next = `+966${digits}`;
    }
    setMobile(next);
  }

  async function sso(provider: "google" | "microsoft") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "oauth_sso",
          provider,
          preferredLanguage: locale,
          accountType: "buyer",
          acquisition: readAcquisition(),
        }),
      });
      const json = (await res.json()) as ApiBody<{ user?: SessionUser }>;
      if (!json.success || !json.data?.user) {
        setError(json.message || (isAr ? "فشل التسجيل السريع" : "SSO failed"));
        setLoading(false);
        return;
      }
      const roles = json.data.user.roles || [];
      const next = searchParams.get("next");
      const dest =
        next && next.startsWith(`/${locale}`) ? next : dashboardPath(locale, roles);
      router.replace(dest);
      router.refresh();
    } catch {
      setError(isAr ? "خطأ في الشبكة" : "Network error");
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const mobileDigits = mobile.replace(/\D/g, "");
    if (mobileDigits.length < 12) {
      setError(isAr ? "أدخل رقم جوال سعودي صحيح" : "Enter a valid Saudi mobile number");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          accountType: "buyer",
          name,
          email,
          password,
          mobile,
          preferredLanguage: locale,
          acquisition: readAcquisition(),
        }),
      });
      const json = (await res.json()) as ApiBody<{ user?: SessionUser }>;
      if (!json.success || !json.data?.user) {
        setError(json.message || json.error || (isAr ? "فشل التسجيل" : "Registration failed"));
        return;
      }
      router.replace(dashboardPath(locale, json.data.user.roles || []));
      router.refresh();
    } catch {
      setError(isAr ? "خطأ في الشبكة" : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell locale={locale} wide audience="buyer">
      <div className="reg-lux">
        <header className="reg-lux__head reg-lux__head--signin">
          <h1 className="reg-lux__signin-title" id="buyer-sign-up-title">
            {isAr ? "إنشاء حساب" : "Sign up"}
          </h1>
          <p className="reg-lux__lead">
            {isAr
              ? "اطلب عروض الأسعار وقارن الموردين من مكان واحد."
              : "Request quotes and compare suppliers in one place."}
          </p>
        </header>

        {SSO_ON ? (
          <div className="reg-lux__sso">
            <button type="button" disabled={loading} onClick={() => void sso("google")}>
              Google
            </button>
            <button type="button" disabled={loading} onClick={() => void sso("microsoft")}>
              Microsoft
            </button>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="reg-lux__form" aria-labelledby="buyer-sign-up-title">
          <div className="reg-lux__panel">
            <AuthLuxStack>
              <AuthLuxField
                label={isAr ? "اسمك" : "Your name"}
                placeholder={isAr ? "مثال: أحمد العتيبي" : "e.g. Ahmed Alotaibi"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                autoComplete="name"
              />
              <AuthLuxField
                label={isAr ? "البريد الإلكتروني" : "Work email"}
                placeholder={isAr ? "you@company.com" : "you@company.com"}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <AuthLuxField
                label={isAr ? "الجوال / واتساب" : "Mobile / WhatsApp"}
                placeholder="+9665XXXXXXXX"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={mobile}
                onChange={handleMobileChange}
                required
                disabled={loading}
              />
              <AuthLuxField
                label={isAr ? "كلمة المرور" : "Password"}
                placeholder={isAr ? "٨ أحرف أو أكثر" : "8+ characters"}
                revealable
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
              />
            </AuthLuxStack>

            {error ? <p className="reg-lux__error">{error}</p> : null}

            <button type="submit" className="auth-lux-btn" disabled={loading}>
              {loading
                ? isAr
                  ? "جارٍ إنشاء الحساب…"
                  : "Creating account…"
                : isAr
                  ? "أنشئ الحساب"
                  : "Create account"}
            </button>
          </div>

          <p className="reg-lux__legal">
            {isAr ? "بإنشاء الحساب توافق على " : "By creating an account you agree to the "}
            <Link href={`/${locale}/terms`}>{isAr ? "شروط الاستخدام" : "terms"}</Link>
            {isAr ? " و" : " and "}
            <Link href={`/${locale}/marketplace-rules`}>
              {isAr ? "قواعد السوق" : "marketplace rules"}
            </Link>
            {isAr ? "، ونعالج بياناتك حسب " : ", and we handle your data under the "}
            <Link href={`/${locale}/privacy`}>{isAr ? "سياسة الخصوصية" : "privacy policy"}</Link>.
          </p>

          <p className="reg-lux__signin">
            {isAr ? "لديك حساب؟" : "Already have an account?"}{" "}
            <Link href={`/${locale}/login`}>{isAr ? "تسجيل الدخول" : "Sign in"}</Link>
          </p>

          <p className="reg-lux__seller-note">
            {isAr ? "تبيع عبر حكم؟" : "Selling on Hukum?"}{" "}
            <a
              href={sellerLoginUrl(locale)}
              {...(sellerIsExternal() ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {isAr ? "دخول البائع" : "Seller sign in"}
            </a>
            <span className="reg-lux__seller-sep" aria-hidden>
              {" / "}
            </span>
            <a
              href={sellerRegisterUrl(locale)}
              {...(sellerIsExternal() ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {isAr ? "تسجيل البائع" : "register"}
            </a>
          </p>
        </form>
      </div>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-stage grid place-items-center">
          <div className="lux-loader">
            <div className="lux-loader-halo" />
            <div className="lux-loader-orbit" />
            <div className="lux-loader-arc" />
            <div className="lux-loader-mark">
              <img src="/brand/hukum-logo.png" alt="Hukum" width={36} height={36} />
            </div>
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
