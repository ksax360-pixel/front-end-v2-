"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { brandInitials, type HomeBrand } from "@/data/home-brands";

function BrandLogo({ brand }: { brand: HomeBrand }) {
  const [failed, setFailed] = useState(false);
  const initials = brandInitials(brand.name);
  const showImg = Boolean(brand.logo) && !failed;

  return (
    <span className="hukum-brands__logo" aria-hidden>
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logo}
          alt=""
          className="hukum-brands__img"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="hukum-brands__mono">{initials}</span>
      )}
    </span>
  );
}

export function BrandMarquee({
  locale,
  brands,
}: {
  locale: Locale;
  brands: HomeBrand[];
}) {
  const isAr = locale === "ar";
  if (!brands.length) return null;

  const loop = [...brands, ...brands];

  return (
    <section className="hukum-brands" aria-labelledby="hukum-brands-title">
      <div className="container-custom hukum-brands__wrap">
        <header className="hukum-brands__head">
          <div>
            <h2 id="hukum-brands-title" className="hukum-brands__title">
              {isAr ? "علامات على حكم" : "Brands on Hukum"}
            </h2>
            <p className="hukum-brands__lead">
              {isAr
                ? "علامات يعرضها الموردون — ابحث عن العلامة وقارن العروض."
                : "Brands suppliers list on Hukum — search one and compare offers."}
            </p>
          </div>
          <Link href={`/${locale}/vendors/brands`} className="hukum-brands__all">
            {isAr ? "كل العلامات" : "View all brands"}
            <ArrowRight size={14} strokeWidth={2.25} className="rtl:rotate-180" />
          </Link>
        </header>
      </div>

      <div
        className="hukum-brands__rail"
        aria-label={isAr ? "علامات تجارية" : "Brand logos"}
      >
        <div className="hukum-brands__track">
          {loop.map((brand, index) => {
            const q = encodeURIComponent(brand.query || brand.name);
            return (
              <Link
                key={`${brand.name}-${index}`}
                href={`/${locale}/products?q=${q}`}
                className="hukum-brands__item"
                aria-label={brand.name}
                title={brand.name}
                aria-hidden={index >= brands.length ? true : undefined}
                tabIndex={index >= brands.length ? -1 : undefined}
              >
                <BrandLogo brand={brand} />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
