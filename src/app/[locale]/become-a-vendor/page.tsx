import { setRequestLocale } from "next-intl/server";
import { isLocale, type Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/modules/seo/static-metadata";
import { SupplierLandingPage } from "@/components/suppliers/SupplierLandingPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return staticPageMetadata(params, "/become-a-vendor", "ignored", undefined, { seoKey: "become-a-vendor" });
}

/** Become a vendor — same supplier landing, kept at this URL and menu label. */
export default async function BecomeAVendorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  setRequestLocale(locale);
  return <SupplierLandingPage locale={locale} />;
}
