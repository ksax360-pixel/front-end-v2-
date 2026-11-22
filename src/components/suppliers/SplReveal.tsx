"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/** Gentle scroll reveal — respects prefers-reduced-motion. */
export function SplReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`spl-reveal ${className}`.trim()}
      style={delay ? ({ ["--spl-delay"]: `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
