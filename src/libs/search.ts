// src/search.ts
import type { ProductItem } from "./searchIndex";

const normalize = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// Synonymes (adapte à ton domaine)
const SYN: Record<string, string[]> = {
  mhr: ["malossi", "team"],
  wr: ["bidalot"],
  brk: ["barikit"],
  most: ["4street"],
  fast: ["2fast"],
  airsal: ["airsaltech", "alu", "fonte"],
};

function expandTokens(tokens: string[]): string[] {
  const out: string[] = [];
  for (const t of tokens) {
    out.push(t);
    if (SYN[t]) out.push(...SYN[t]);
  }
  return Array.from(new Set(out));
}

type SearchOpts = {
  limit?: number;
  groups?: string[];          // ex: ["competition","alldays"]
  categoryIds?: string[];     // ex: ["50","70","500"]
  minPrice?: number;
  maxPrice?: number;
  orMode?: boolean;           // false = ET (par défaut), true = OU
};

export function searchProducts(
  index: ProductItem[],
  query: string,
  opts: SearchOpts = {}
): ProductItem[] {
  const { limit = 100, groups, categoryIds, minPrice, maxPrice, orMode = false } = opts;

  const q = normalize(query);
  if (!q) return [];

  const toks = expandTokens(q.split(/\s+/).filter(Boolean));

  const scored: (ProductItem & { _score: number })[] = [];
  for (const p of index) {
    if (groups && !groups.includes(p.group)) continue;
    if (categoryIds && (!p.categoryId || !categoryIds.includes(p.categoryId))) continue;

    const priceNum = typeof p.price === "string" ? parseFloat((p.price.match(/[\d.]+/)||["0"])[0]) : p.price;
    if (typeof minPrice === "number" && (priceNum ?? Infinity) < minPrice) continue;
    if (typeof maxPrice === "number" && (priceNum ?? -Infinity) > maxPrice) continue;

    const title = normalize(p.title);
    const brand = normalize(p.brand || "");
    const desc  = normalize(p.description || "");
    const tags  = normalize((p.tags || []).join(" "));
    const hay = `${title} ${brand} ${desc} ${tags}`;

    const hits = toks.map(t => hay.includes(t));
    const match = orMode ? hits.some(Boolean) : hits.every(Boolean);
    if (!match) continue;

    // petit scoring pondéré
    let score = 0;
    for (const t of toks) {
      if (title.includes(t)) score += 5;
      if (brand.includes(t)) score += 4;
      if (desc.includes(t))  score += 2;
      if (tags.includes(t))  score += 1;
    }
    // un petit bonus si groupe = competition ou alldays pour prioriser les configs
    if (p.group === "competition" || p.group === "alldays") score += 1;

    scored.push({ ...p, _score: score });
  }

  return scored.sort((a, b) => b._score - a._score).slice(0, limit);
}
