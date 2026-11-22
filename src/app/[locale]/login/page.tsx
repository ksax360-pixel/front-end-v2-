"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { DEMO_LOGIN_EVENT } from "@/components/auth/DemoAccessChip";
import { AuthLuxField, AuthLuxStack } from "@/components/auth/AuthLuxField";
import { isLocale, type Locale } from "@/i18n/config";
import { sellerIsExternal, sellerLoginUrl, sellerRegisterUrl } from "@/lib/seller-admin";

/** Sign-in methods that need a backend this build may not have: off unless the env turns them on. */
const SSO_ON = process.env.NEXT_PUBLIC_AUTH_SSO === "1";
const OTP_ON = process.env.NEXT_PUBLIC_AUTH_OTP === "1";
import type { ApiBody } from "@/lib/api";

type SessionUser = { roles?: string[] };

function dashboardPath(locale: Locale, roles: string[] = []) {
  if (roles.some((r) => ["admin", "super_admin"].includes(r))) return `/${locale}/admin`;
  if (roles.some((r) => r.startsWith("vendor"))) return `/${locale}/vendor/dashboard`;
  return `/${locale}/buyer/dashboard`;
}

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const raw = typeof params.locale === "string" ? params.locale : "en";
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const isAr = locale === "ar";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");

  useEffect(() => {
    const onFill = (event: Event) => {
      const detail = (event as CustomEvent<{ email?: string; password?: string }>).detail;
      if (detail?.email) setEmail(detail.email);
      if (detail?.password) setPassword(detail.password);
      setError("");
    };
    window.addEventListener(DEMO_LOGIN_EVENT, onFill);
    return () => window.removeEventListener(DEMO_LOGIN_EVENT, onFill);
  }, []);

  // Already signed in → go straight to the right dashboard
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth", { credentials: "include" });
        const json = (await res.json()) as ApiBody<{
          session?: SessionUser;
          user?: SessionUser & { roles?: string[] };
        }>;
        if (cancelled || !json.success) return;
        const roles =
          json.data?.session?.roles ||
          json.data?.user?.roles ||
          [];
        const next = new URLSearchParams(window.location.search).get("next");
        const dest =
          next && next.startsWith(`/${locale}`)
            ? next
            : dashboardPath(locale, roles);
        router.replace(dest);
        router.refresh();
      } catch {
        /* stay on login */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const json = (await res.json()) as ApiBody<{ user?: SessionUser }>;
      if (!json.success || !json.data?.user) {
        setError(json.message || (isAr ? "فشل تسجيل الدخول" : "Login failed"));
        setLoading(false);
        return;
      }
      if (typeof window !== "undefined" && !localStorage.getItem("theme")) {
        localStorage.setItem("theme", "light");
      }
      const roles = json.data.user.roles || [];
      const next = new URLSearchParams(window.location.search).get("next");
      const dest =
        next && next.startsWith(`/${locale}`) ? next : dashboardPath(locale, roles);
      router.replace(dest);
      router.refresh();
    } catch {
      setError(isAr ? "خطأ في الشبكة" : "Network error");
      setLoading(false);
    }
  }

  async function sendOtp() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_auth_otp", phone }),
      });
      const json = (await res.json()) as ApiBody<{ demoOtp?: string }>;
      if (!json.success) {
        setError(json.message || "OTP failed");
        setLoading(false);
        return;
      }
      setOtpSent(true);
      if (json.data?.demoOtp) setDemoOtp(json.data.demoOtp);
    } catch {
      setError(isAr ? "خطأ في الشبكة" : "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_auth_otp", phone, otp }),
      });
      const json = (await res.json()) as ApiBody<{ user?: SessionUser }>;
      if (!json.success || !json.data?.user) {
        setError(json.message || "OTP verify failed");
        setLoading(false);
        return;
      }
      const roles = json.data.user.roles || [];
      router.replace(dashboardPath(locale, roles));
      router.refresh();
    } catch {
      setError(isAr ? "خطأ في الشبكة" : "Network error");
      setLoading(false);
    }
  }

  async function sso(provider: "google" | "microsoft") {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "oauth_sso", provider }),
      });
      const json = (await res.json()) as ApiBody<{ user?: SessionUser }>;
      if (!json.success || !json.data?.user) {
        setError(json.message || (isAr ? "فشل الدخول السريع" : "SSO failed"));
        setLoading(false);
        return;
      }
      const roles = json.data.user.roles || [];
      const next = new URLSearchParams(window.location.search).get("next");
      const dest =
        next && next.startsWith(`/${locale}`) ? next : dashboardPath(locale, roles);
      router.replace(dest);
      router.refresh();
    } catch {
      setError(isAr ? "خطأ في الشبكة" : "Network error");
      setLoading(false);
    }
  }

  return (
    <AuthShell locale={locale} audience="buyer">
      <div className="reg-lux">
        <header className="reg-lux__head reg-lux__head--signin">
          <h1 className="reg-lux__signin-title" id="buyer-sign-in-title">
            {isAr ? "تسجيل الدخول" : "Sign in"}
          </h1>
          <p className="reg-lux__lead">
            {OTP_ON
              ? isAr
                ? "بريدك أو رقم جوالك، وتكمل من حيث وقفت."
                : "With your email or mobile number. You'll pick up where you left off."
              : isAr
                ? "ببريدك وكلمة المرور، وتكمل من حيث وقفت."
                : "With your email and password. You'll pick up where you left off."}
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

        {OTP_ON ? (
          <div className="reg-lux__mode">
            <button
              type="button"
              className={mode === "password" ? "is-on" : undefined}
              onClick={() => setMode("password")}
            >
              {isAr ? "بريد" : "Email"}
            </button>
            <button
              type="button"
              className={mode === "otp" ? "is-on" : undefined}
              onClick={() => setMode("otp")}
            >
              {isAr ? "رمز الجوال" : "Mobile OTP"}
            </button>
          </div>
        ) : null}

        {mode === "password" ? (
          <form
            onSubmit={handleSubmit}
            className="reg-lux__form"
            aria-labelledby="buyer-sign-in-title"
            aria-busy={loading}
          >
            <div className="reg-lux__panel">
              <AuthLuxStack>
                <AuthLuxField
                  label={isAr ? "البريد الإلكتروني" : "Email"}
                  placeholder={isAr ? "you@company.com" : "you@company.com"}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <AuthLuxField
                  label={isAr ? "كلمة المرور" : "Password"}
                  placeholder={isAr ? "أدخل كلمة المرور" : "Enter your password"}
                  revealable
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </AuthLuxStack>
              {error ? (
                <p role="alert" aria-live="assertive" className="reg-lux__error">
                  {error}
                </p>
              ) : null}
              <button type="submit" disabled={loading} className="auth-lux-btn">
                {loading
                  ? isAr
                    ? "جارٍ الدخول…"
                    : "Signing in…"
                  : isAr
                    ? "تسجيل الدخول"
                    : "Sign in"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="reg-lux__form" aria-busy={loading}>
            <div className="reg-lux__panel">
              <AuthLuxStack>
                <AuthLuxField
                  label={isAr ? "الجوال / واتساب" : "Mobile / WhatsApp"}
                  placeholder="+9665XXXXXXXX"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={loading}
                />
                {otpSent ? (
                  <AuthLuxField
                    label={isAr ? "رمز OTP" : "OTP code"}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={loading}
                  />
                ) : null}
              </AuthLuxStack>
              {demoOtp ? (
                <p className="reg-lux__error" style={{ color: "#8a9490" }}>
                  {isAr ? "رمز تجريبي:" : "Demo code:"} {demoOtp}
                </p>
              ) : null}
              {error ? (
                <p role="alert" aria-live="assertive" className="reg-lux__error">
                  {error}
                </p>
              ) : null}
              {!otpSent ? (
                <button
                  type="button"
                  disabled={loading || !phone}
                  className="auth-lux-btn"
                  onClick={() => void sendOtp()}
                >
                  {loading ? "…" : isAr ? "إرسال الرمز" : "Send code"}
                </button>
              ) : (
                <button type="submit" disabled={loading} className="auth-lux-btn">
                  {loading ? "…" : isAr ? "تأكيد الدخول" : "Verify & sign in"}
                </button>
              )}
            </div>
          </form>
        )}

        <div className="reg-lux__links">
          <Link href={`/${locale}/forgot-password`}>
            {isAr ? "نسيت كلمة المرور" : "Forgot password"}
          </Link>
          <Link href={`/${locale}/register`}>{isAr ? "إنشاء حساب" : "Sign up"}</Link>
        </div>

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
      </div>
    </AuthShell>
  );
}
