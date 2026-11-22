/** Brands featured in the homepage marquee. Live DB brands are merged at render time. */
export type HomeBrand = {
  name: string;
  /** Optional local or remote logo path. Falls back to a monogram mark. */
  logo?: string;
  query?: string;
};

/** Curated B2B brands with original logos (Wikimedia Commons / official marks). */
export const HOME_BRANDS_FALLBACK: HomeBrand[] = [
  { name: "Siemens", logo: "/brands/siemens.svg" },
  { name: "Schneider Electric", logo: "/brands/schneider-electric.svg" },
  { name: "ABB", logo: "/brands/abb.svg" },
  { name: "3M", logo: "/brands/3m.svg" },
  { name: "Honeywell", logo: "/brands/honeywell.svg" },
  { name: "Hilti", logo: "/brands/hilti.svg" },
  { name: "Bosch", logo: "/brands/bosch.svg" },
  { name: "Philips", logo: "/brands/philips.svg" },
  { name: "Grundfos", logo: "/brands/grundfos.png" },
  { name: "Fluke", logo: "/brands/fluke.svg" },
  { name: "Caterpillar", logo: "/brands/caterpillar.svg" },
  { name: "Makita", logo: "/brands/makita.svg" },
  { name: "DeWalt", logo: "/brands/dewalt.svg" },
  { name: "Samsung", logo: "/brands/samsung.svg" },
];

export function brandInitials(name: string): string {
  const cleaned = name.replace(/\bdemo\b/gi, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return cleaned.slice(0, 2).toUpperCase() || "HK";
}
