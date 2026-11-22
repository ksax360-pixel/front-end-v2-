"use client";

import { useEffect, useState } from "react";

/** Compact sticky registration CTA after the hero scrolls away (mobile). */
export function SupplierLandingStickyCta({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("spl-hero");
    const finale = document.getElementById("spl-finale");
    if (!hero) return;

    const io = new IntersectionObserver(
      (entries) => {
        const heroEntry = entries.find((e) => e.target.id === "spl-hero");
        const finaleEntry = entries.find((e) => e.target.id === "spl-finale");
        const heroGone = heroEntry ? !heroEntry.isIntersecting : true;
        const finaleVisible = finaleEntry?.isIntersecting ?? false;
        setVisible(heroGone && !finaleVisible);
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(hero);
    if (finale) io.observe(finale);
    return () => io.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div className="spl-sticky" role="region" aria-label={label}>
      <a
        href={href}
        className="spl-sticky__btn"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
      </a>
    </div>
  );
}
