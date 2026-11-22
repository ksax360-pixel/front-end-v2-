import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  ChevronDown,
  FileSpreadsheet,
  Inbox,
  MapPin,
  MessageSquare,
  Package,
  Search,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { sellerIsExternal, sellerLoginUrl, sellerRegisterUrl } from "@/lib/seller-admin";
import { SITE_CONTACT } from "@/data/site-contact";
import { SupplierLandingStickyCta } from "@/components/suppliers/SupplierLandingStickyCta";
import { SplReveal } from "@/components/suppliers/SplReveal";

/** Shared supplier / become-a-vendor landing. */
export function SupplierLandingPage({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const L = (en: string, ar: string): string => (isAr ? ar : en);
  const registerHref = sellerRegisterUrl(locale);
  const loginHref = sellerLoginUrl(locale);
  const joinCta = L("Join for free", "انضم مجاناً");
  const ext = sellerIsExternal() ? { target: "_blank" as const, rel: "noopener noreferrer" } : {};

  const benefits = [
    {
      icon: Package,
      title: L("Show what you supply", "اعرض وش تورّد"),
      text: L("Clear product details buyers can trust.", "تفاصيل منتجات واضحة يثق فيها المشتري."),
    },
    {
      icon: Search,
      title: L("Be easier to find", "كن أسهل للوصول"),
      text: L("Categories and cities that match real demand.", "فئات ومدن تطابق الطلب الحقيقي."),
    },
    {
      icon: MessageSquare,
      title: L("Answer enquiries", "رد على الاستفسارات"),
      text: L("Reply with availability, price and terms.", "رد بالتوفر والسعر والشروط."),
    },
  ];

  const steps = [
    {
      n: "01",
      icon: UserRound,
      title: L("Create your account", "أنشئ حسابك"),
      text: L("Add your contact details.", "أضف بيانات تواصلك."),
    },
    {
      n: "02",
      icon: Building2,
      title: L("Add your company", "أضف شركتك"),
      text: L("Profile, documents and service areas.", "الملف والمستندات ومناطق الخدمة."),
    },
    {
      n: "03",
      icon: FileSpreadsheet,
      title: L("List your catalogue", "اعرض كتالوجك"),
      text: L("Photos and specs — or Excel / CSV drafts.", "صور ومواصفات — أو مسودات Excel / CSV."),
    },
    {
      n: "04",
      icon: Inbox,
      title: L("Respond to buyers", "رد على المشترين"),
      text: L("Review requests and send your reply.", "راجع الطلبات وأرسل ردك."),
    },
  ];

  const terms = [
    {
      icon: BadgeCheck,
      title: L("Free to list through 2027", "عرض مجاني حتى 2027"),
      text: L("Founding suppliers list free under the current offer.", "الموردون المؤسسون يعرضون مجاناً ضمن العرض الحالي."),
    },
    {
      icon: Store,
      title: L("You keep the deal", "الصفقة لك"),
      text: L("Hukum does not take a percentage of your sales.", "حكم ما تأخذ نسبة من مبيعاتك."),
    },
    {
      icon: ShieldCheck,
      title: L("Verified when ready", "التوثيق عند الجاهزية"),
      text: L("CR checks confirm identity — not product quality.", "فحص السجل يثبت الهوية — مو جودة المنتج."),
    },
  ];

  const faqs = [
    {
      q: L("Who can join?", "مين يقدر ينضم؟"),
      a: L(
        "Businesses supplying other businesses — manufacturers, distributors, wholesalers and service providers.",
        "منشآت تورّد لمنشآت أخرى — مصنّعون وموزّعون وتجار جملة ومقدّمو خدمات."
      ),
    },
    {
      q: L("What do I need?", "وش أحتاج؟"),
      a: L(
        "Contact details, company information, product photos. Commercial registration may be requested for review.",
        "بيانات تواصل، بيانات شركة، صور منتجات. وقد يُطلب السجل التجاري للمراجعة."
      ),
    },
    {
      q: L("Can I upload a catalogue?", "أقدر أرفع كتالوج؟"),
      a: L(
        "Yes — Excel or CSV, up to 500 products as drafts you review before publishing.",
        "نعم — Excel أو CSV، حتى ٥٠٠ منتج كمسودات تراجعها قبل النشر."
      ),
    },
    {
      q: L("How do buyers reach me?", "كيف يوصلني المشتري؟"),
      a: L(
        "Matched requests land in your inbox. You reply inside Hukum with availability and terms.",
        "الطلبات المطابقة تصل لصندوقك. وترد داخل حكم بالتوفر والشروط."
      ),
    },
    {
      q: L("Need help?", "تحتاج مساعدة؟"),
      a: L(
        `Email ${SITE_CONTACT.vendorsEmail} or use the Help centre after you sign in.`,
        `راسل ${SITE_CONTACT.vendorsEmail} أو استخدم مركز المساعدة بعد الدخول.`
      ),
    },
  ];

  return (
    <div className="spl" dir={isAr ? "rtl" : "ltr"}>
      <header className="spl-hero" id="spl-hero">
        <div className="spl-hero__watermarks" aria-hidden>
          <span className="spl-hero__mark" />
        </div>
        <div className="spl-hero__center">
          <span className="spl-hero__rule spl-hero__anim" aria-hidden />
          <p className="spl-hero__eyebrow spl-hero__anim" style={{ ["--i" as string]: 1 }}>
            {L("A new way to", "طريقة جديدة لـ")}
          </p>
          <h1 className="spl-hero__title spl-hero__anim" style={{ ["--i" as string]: 2 }}>
            <span className="spl-hero__title-green">
              {L("Grow Your Sales.", "نمِّ مبيعاتك.")}
            </span>
          </h1>
          <p className="spl-hero__lead spl-hero__anim" style={{ ["--i" as string]: 3 }}>
            {L(
              "Connect with buyers beyond your existing network",
              "تواصل مع مشترين خارج شبكتك الحالية"
            )}
          </p>
          <div className="spl-hero__actions spl-hero__anim" style={{ ["--i" as string]: 4 }}>
            <a href={registerHref} {...ext} className="hukum-btn hukum-btn--primary hukum-btn--lg">
              {joinCta}
            </a>
            <a href={loginHref} {...ext} className="hukum-btn hukum-btn--ghost hukum-btn--lg">
              {L("Supplier sign-in", "دخول المورد")}
            </a>
          </div>
        </div>
      </header>

      <div className="spl__wrap">
        <SplReveal>
          <section className="spl-profile" aria-labelledby="spl-profile-h">
            <div className="spl-sec__head spl-sec__head--center">
              <h2 id="spl-profile-h">{L("A clear company profile", "ملف شركة واضح")}</h2>
              <p>{L("Everything buyers need before they enquire.", "كل اللي يحتاجه المشتري قبل ما يستفسر.")}</p>
            </div>

            <div className="spl-profile__grid">
              <figure className="spl-preview" aria-label={L("Example company profile", "مثال لملف شركة")}>
                <figcaption>{L("Example", "مثال")}</figcaption>
                <div className="spl-preview__head">
                  <div className="spl-preview__logo" aria-hidden>
                    NS
                  </div>
                  <div>
                    <b>{L("Najd Safety Trading", "نجد لتجارة السلامة")}</b>
                    <span>
                      <MapPin size={13} aria-hidden /> {L("Riyadh", "الرياض")}
                    </span>
                  </div>
                </div>
                <dl className="spl-preview__meta">
                  <div>
                    <dt>{L("Type", "النوع")}</dt>
                    <dd>{L("Distributor", "موزّع")}</dd>
                  </div>
                  <div>
                    <dt>{L("Supplies", "تورّد")}</dt>
                    <dd>{L("Safety gear", "معدات سلامة")}</dd>
                  </div>
                  <div>
                    <dt>{L("Serves", "تخدم")}</dt>
                    <dd>{L("Riyadh, Jeddah", "الرياض، جدة")}</dd>
                  </div>
                </dl>
                <div className="spl-preview__product">
                  <div className="spl-preview__photo" aria-hidden />
                  <div>
                    <b>{L("Safety helmet", "خوذة سلامة")}</b>
                    <span>{L("EN 397 · MOQ 50", "EN 397 · الحد الأدنى 50")}</span>
                  </div>
                </div>
                <span className="spl-preview__cta">{L("Send enquiry", "أرسل استفساراً")}</span>
              </figure>

              <ul className="spl-benefits">
                {benefits.map((b, i) => (
                  <li key={b.title} className="spl-benefits__item" style={{ ["--i" as string]: i }}>
                    <span className="spl-icon" aria-hidden>
                      <b.icon size={18} strokeWidth={1.75} />
                    </span>
                    <div>
                      <b>{b.title}</b>
                      <p>{b.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </SplReveal>

        <SplReveal>
          <section className="spl-how" id="spl-how" aria-labelledby="spl-how-h">
            <div className="spl-sec__head spl-sec__head--center">
              <h2 id="spl-how-h">{L("Four steps to start", "أربع خطوات للبدء")}</h2>
            </div>
            <ol className="spl-steps">
              {steps.map((s, i) => (
                <li key={s.n} style={{ ["--i" as string]: i }}>
                  <span className="spl-steps__icon" aria-hidden>
                    <s.icon size={18} strokeWidth={1.75} />
                  </span>
                  <span className="spl-steps__n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </section>
        </SplReveal>

        <SplReveal>
          <section className="spl-enquiry" aria-labelledby="spl-enquiry-h">
            <div className="spl-enquiry__copy">
              <h2 id="spl-enquiry-h">{L("See the request before you reply", "شوف الطلب قبل ما ترد")}</h2>
              <p>{L("Item, quantity, city and timing — ready for your answer.", "المنتج والكمية والمدينة والتوقيت — جاهزة لردك.")}</p>
              <a href={registerHref} {...ext} className="hukum-btn hukum-btn--primary">
                {joinCta}
              </a>
            </div>

            <figure className="spl-enq" aria-label={L("Example enquiry", "مثال لاستفسار")}>
              <figcaption>{L("Example", "مثال")}</figcaption>
              <p className="spl-enq__new">{L("New enquiry", "استفسار جديد")}</p>
              <b>{L("White safety helmets", "خوذ سلامة بيضاء")}</b>
              <dl>
                <div>
                  <dt>{L("Qty", "الكمية")}</dt>
                  <dd>500</dd>
                </div>
                <div>
                  <dt>{L("City", "المدينة")}</dt>
                  <dd>
                    <MapPin size={13} aria-hidden /> {L("Riyadh", "الرياض")}
                  </dd>
                </div>
                <div>
                  <dt>{L("Needed", "مطلوب")}</dt>
                  <dd>{L("2 weeks", "أسبوعين")}</dd>
                </div>
              </dl>
              <span className="spl-enq__action">{L("View enquiry", "عرض الاستفسار")}</span>
            </figure>
          </section>
        </SplReveal>

        <SplReveal>
          <section className="spl-terms" aria-labelledby="spl-terms-h">
            <div className="spl-sec__head spl-sec__head--center">
              <h2 id="spl-terms-h">{L("Simple terms", "شروط بسيطة")}</h2>
            </div>
            <ul className="spl-terms__cards">
              {terms.map((t, i) => (
                <li key={t.title} style={{ ["--i" as string]: i }}>
                  <span className="spl-icon spl-icon--gold" aria-hidden>
                    <t.icon size={18} strokeWidth={1.75} />
                  </span>
                  <b>{t.title}</b>
                  <p>{t.text}</p>
                </li>
              ))}
            </ul>
            <div className="spl-terms__links">
              <Link href={`/${locale}/verification`} className="spl-text-link">
                {L("Verification details", "تفاصيل التوثيق")}
              </Link>
            </div>
          </section>
        </SplReveal>

        <SplReveal>
          <section className="spl-faq" aria-labelledby="spl-faq-h">
            <div className="spl-sec__head">
              <h2 id="spl-faq-h">{L("Quick answers", "أجوبة سريعة")}</h2>
            </div>
            <div className="hukum-accordion">
              {faqs.map((item) => (
                <details key={item.q} className="hukum-accordion__item">
                  <summary className="hukum-accordion__summary">
                    <span>{item.q}</span>
                    <ChevronDown size={18} aria-hidden />
                  </summary>
                  <div className="hukum-accordion__body">
                    <p>{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        </SplReveal>

        <SplReveal>
          <aside className="spl-finale hukum-premium-panel" id="spl-finale">
            <div className="spl-finale__copy">
              <h2>{L("Make your company easier to find", "خلّ شركتك أسهل للوصول")}</h2>
              <p>{L("Create your profile and show what you offer.", "أنشئ ملفك وأظهر ما تقدّمه.")}</p>
            </div>
            <div className="spl-finale__actions">
              <a href={registerHref} {...ext} className="hukum-btn hukum-btn--gold hukum-btn--lg">
                {joinCta}
              </a>
              <a href={loginHref} {...ext} className="spl-finale__ghost">
                {L("Supplier sign-in", "دخول المورد")}
              </a>
            </div>
          </aside>
        </SplReveal>
      </div>

      <SupplierLandingStickyCta
        href={registerHref}
        label={joinCta}
        external={sellerIsExternal()}
      />
    </div>
  );
}
