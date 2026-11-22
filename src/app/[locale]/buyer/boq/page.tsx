"use client";

// The old page posted to /api/procurement/boq, which this app doesn't have. The workspace now uses the
// same in-browser BOQ reader as the public page, which hands the lines to the request form.

import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BuyerHubHeader } from "@/components/buyer/BuyerHubHeader";
import { BuyerFolderPanel } from "@/components/buyer/BuyerFolderPanel";
import { BUYER_NAV } from "@/lib/buyer-nav";
import { BoqUploader } from "@/components/boq/BoqUploader";
import type { Locale } from "@/i18n/config";

export default function BuyerBoqPage() {
  const params = useParams();
  const locale = (String(params.locale || "en") === "ar" ? "ar" : "en") as Locale;
  const isAr = locale === "ar";

  return (
    <DashboardShell locale={locale} title="Buyer" nav={[...BUYER_NAV]} allowDark={false}>
      <div className="boq bh sd-page ib-hub" dir={isAr ? "rtl" : "ltr"}>
        <BuyerHubHeader
          locale={locale}
          title={isAr ? "رفع جدول الكميات" : "Upload a BOQ"}
          lead={
            isAr
              ? "ارفع ملف Excel أو CSV، راجع البنود، وأرسلها طلباً واحداً."
              : "Drop an Excel or CSV file, check the lines, and send them as one request."
          }
        />
        <BuyerFolderPanel tabLabel={isAr ? "جدول الكميات" : "BOQ"}>
          <BoqUploader locale={locale} />
        </BuyerFolderPanel>
      </div>
    </DashboardShell>
  );
}
