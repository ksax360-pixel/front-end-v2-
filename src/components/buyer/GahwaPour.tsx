"use client";

import { useEffect, useId, useRef, useState } from "react";

type Props = {
  size?: number;
  variant?: "day" | "night";
  paused?: boolean;
  className?: string;
};

/**
 * Decorative Arabic coffee (gahwa) pour — thin gold line-art with a calm looping ritual.
 * Groups are independently animatable: #dallah, #dallah-lid, #stream, cups, steam, #drop.
 */
export function GahwaPour({
  size = 200,
  variant = "day",
  paused = false,
  className = "",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const strokeId = `gahwaStroke-${uid}`;
  const strokeNightId = `gahwaStrokeNight-${uid}`;
  const liquidId = `gahwaLiquid-${uid}`;
  const cup1ClipId = `cup1Clip-${uid}`;
  const cup2ClipId = `cup2Clip-${uid}`;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05, rootMargin: "48px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    function onVis() {
      setTabVisible(document.visibilityState === "visible");
    }
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (reduced) {
      setDrawn(true);
      return;
    }
    const t = window.setTimeout(() => setDrawn(true), 1300);
    return () => window.clearTimeout(t);
  }, [reduced]);

  const isPaused = paused || !inView || !tabVisible || (!reduced && !drawn);
  const stroke =
    variant === "night" ? `url(#${strokeNightId})` : `url(#${strokeId})`;
  const fillSoft =
    variant === "night" ? "rgba(245,237,217,0.14)" : "rgba(198,161,91,0.1)";
  const liquid = variant === "night" ? "#d8bd86" : "#c6a15b";
  const finial = variant === "night" ? "#f5edd9" : "#c6a15b";

  return (
    <div
      ref={rootRef}
      className={[
        "gahwa-pour",
        `gahwa-pour--${variant}`,
        drawn || reduced ? "is-looping" : "is-drawing",
        isPaused ? "is-paused" : "",
        reduced ? "is-reduced" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: size, height: Math.round(size * 0.88) }}
      aria-hidden
    >
      <svg
        viewBox="0 0 240 210"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="gahwa-pour__svg"
      >
        <defs>
          <linearGradient
            id={strokeId}
            x1="36"
            y1="24"
            x2="210"
            y2="190"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#e8dcc2" />
            <stop offset="0.42" stopColor="#c6a15b" />
            <stop offset="1" stopColor="#9a7b4f" />
          </linearGradient>
          <linearGradient
            id={strokeNightId}
            x1="36"
            y1="24"
            x2="210"
            y2="190"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#fbf7ef" />
            <stop offset="0.5" stopColor="#d8bd86" />
            <stop offset="1" stopColor="#c6a15b" />
          </linearGradient>
          <linearGradient id={liquidId} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#e8dcc2" stopOpacity="0.95" />
            <stop offset="1" stopColor="#b8924a" stopOpacity="0.9" />
          </linearGradient>
          <clipPath id={cup1ClipId}>
            <path d="M48 146h36c0 12-6 22-18 22s-18-10-18-22z" />
          </clipPath>
          <clipPath id={cup2ClipId}>
            <path d="M88 150h32c0 10.5-5.2 19-16 19s-16-8.5-16-19z" />
          </clipPath>
        </defs>

        <ellipse
          className="gahwa-pour__glow"
          cx="150"
          cy="120"
          rx="82"
          ry="66"
          fill={fillSoft}
        />

        <g
          id="tray"
          className="gahwa-line"
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinecap="round"
        >
          <path d="M40 178h96" opacity="0.5" />
          <path d="M46 178c3 5 14 8 32 8s29-3 32-8" opacity="0.35" />
        </g>

        {/* Cup 1 — nearer spout */}
        <g
          id="cup-1"
          className="gahwa-line"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M46 138h40c.6 0 1.15.5 1.1 1.1C86 153 79.5 168 66 168s-20-15-21.1-28.9c-.05-.6.5-1.1 1.1-1.1z" />
          <path d="M49 138c1.8-3.2 8-5.2 17-5.2s15.2 2 17 5.2" opacity="0.65" />
          <g id="cup-1-fill" className="gahwa-fill gahwa-fill--1" clipPath={`url(#${cup1ClipId})`}>
            <rect
              className="gahwa-fill__liquid"
              x="46"
              y="156"
              width="42"
              height="20"
              fill={`url(#${liquidId})`}
            />
            <path
              className="gahwa-fill__wave"
              d="M46 156c5 1.4 9-1.4 14 0s9 1.4 14 0 9-1.4 14 0v2.2H46V156z"
              fill={liquid}
              opacity="0.5"
            />
            <circle
              className="gahwa-ripple gahwa-ripple--1"
              cx="66"
              cy="157"
              r="5.5"
              stroke={liquid}
              strokeWidth="1"
              fill="none"
            />
          </g>
        </g>

        {/* Cup 2 */}
        <g
          id="cup-2"
          className="gahwa-line"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M86 144h36c.55 0 1 .45.95 1C122 158 116 170 104 170s-18-12-18.95-25c-.05-.55.4-1 .95-1z" />
          <path d="M89 144c1.5-2.8 7-4.6 15-4.6s13.5 1.8 15 4.6" opacity="0.65" />
          <g id="cup-2-fill" className="gahwa-fill gahwa-fill--2" clipPath={`url(#${cup2ClipId})`}>
            <rect
              className="gahwa-fill__liquid"
              x="86"
              y="158"
              width="36"
              height="18"
              fill={`url(#${liquidId})`}
            />
            <path
              className="gahwa-fill__wave"
              d="M86 158c4 1.2 7.5-1.2 12 0s8 1.2 12 0 8-1.2 12 0v2H86v-2z"
              fill={liquid}
              opacity="0.5"
            />
            <circle
              className="gahwa-ripple gahwa-ripple--2"
              cx="104"
              cy="159"
              r="4.8"
              stroke={liquid}
              strokeWidth="1"
              fill="none"
            />
          </g>
        </g>

        <g
          id="dates"
          className="gahwa-line"
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.72"
        >
          <ellipse cx="138" cy="172" rx="4" ry="2.6" transform="rotate(-16 138 172)" />
          <ellipse cx="147" cy="174" rx="3.6" ry="2.4" transform="rotate(14 147 174)" />
          <ellipse cx="143" cy="167" rx="3.3" ry="2.2" transform="rotate(-6 143 167)" />
          <path d="M132 178h22" opacity="0.4" />
        </g>

        <g
          className="gahwa-steam-cup"
          stroke={stroke}
          strokeWidth="1.15"
          strokeLinecap="round"
          fill="none"
        >
          <path
            id="steam-1"
            className="gahwa-steam gahwa-steam--1"
            d="M62 128c2.5-7 0-12 2.5-18 2-6-1-11 1.5-16"
          />
          <path
            id="steam-2"
            className="gahwa-steam gahwa-steam--2"
            d="M72 126c2-6-1-11 1.5-16 2-6 0-10 2-15"
          />
          <path
            id="steam-3"
            className="gahwa-steam gahwa-steam--3"
            d="M104 132c2-6 0-10 2-16 1.5-5-1-9 1.5-14"
          />
        </g>

        <g id="dallah" className="gahwa-dallah">
          <g
            className="gahwa-line"
            stroke={stroke}
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            {/* Rear handle */}
            <path d="M178 92c20-4 32 12 28 30-3 16-16 26-32 24" />
            {/* Tall body with narrow waist + flared base */}
            <path d="M138 88c-3 10-2 18 2 28 5 14 4 26-4 38-5 8-2 20 10 26 9 5 24 5 34 0 12-6 15-18 10-26-8-12-9-24-4-38 4-10 5-18 2-28" />
            <path d="M140 122h42" opacity="0.42" />
            <path d="M132 168c8 10 22 14 32 14s24-4 32-14" />
            {/* Crescent spout → tip near cups */}
            <path d="M140 94c-16-4-34 0-46 16-7 9-14 12-22 10 10-1 18-8 24-18 8-14 24-24 42-22" />
            <path d="M76 116c-1.5 2.5-2 5-1 7.5" opacity="0.75" />
          </g>

          <g
            id="dallah-lid"
            className="gahwa-lid gahwa-line"
            stroke={stroke}
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M142 88c3-12 12-18 24-18s21 6 24 18" />
            <path d="M150 72c4-9 11-14 16-14s12 5 16 14" />
            <path d="M166 46v14" />
            <circle cx="166" cy="44" r="2.3" fill={finial} stroke="none" />
          </g>

          {/* Stream rides with the pot so it leaves the spout tip while tilted */}
          <g id="stream">
            <path
              className="gahwa-stream gahwa-stream--a"
              d="M74 122c-6 10-12 20-16 28-3 6-5 11-6 14"
              stroke={liquid}
              strokeWidth="1.7"
              strokeLinecap="round"
              fill="none"
            />
            <path
              className="gahwa-stream gahwa-stream--b"
              d="M74 122c-2 12 2 22 8 32 4 6 8 11 12 15"
              stroke={liquid}
              strokeWidth="1.7"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          <circle
            id="drop"
            className="gahwa-drop"
            cx="74"
            cy="122"
            r="1.7"
            fill={liquid}
          />

          <g
            className="gahwa-steam-spout"
            stroke={stroke}
            strokeWidth="1.1"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          >
            <path
              className="gahwa-steam gahwa-steam--spout-a"
              d="M72 108c-3-6-2-10-4.5-15"
            />
            <path
              className="gahwa-steam gahwa-steam--spout-b"
              d="M80 106c-2-7 0-11-2.5-16"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
