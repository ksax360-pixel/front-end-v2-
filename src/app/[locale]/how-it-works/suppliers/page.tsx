import { redirect } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { staticPageMetadata } from "@/modules/seo/static-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return staticPageMetadata(params, "/become-a-vendor", "ignored", undefined, { seoKey: "become-a-vendor" });
}

/** Canonical page lives at /become-a-vendor. */
export default async function HowItWorksSuppliersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "en";
  redirect(`/${locale}/become-a-vendor`);
}
