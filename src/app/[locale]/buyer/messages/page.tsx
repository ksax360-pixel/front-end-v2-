import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { isLocale, type Locale } from "@/i18n/config";

/** Messages live under Requests now (`?tab=messages`). */
export default async function MessagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  setRequestLocale(locale);
  redirect(`/${locale}/buyer/rfqs?tab=messages`);
}
