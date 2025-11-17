// src/searchIndex.ts
// ⚠️ adapte les chemins d'import à ton arborescence exacte
import { categories as compCategories } from "./configCompetition";
import { categories as allDaysCategories } from "./configurations";
import { categories as clignoCategories } from "./clignotant";
import { categories as eclairageCategories } from "./eclairage";
import { categories as entretienCategories } from "./entretien";
import { categories as freinCategories } from "./frein";
import { categories as mecaCategories } from "./meca";
import { categories as plusDuMotardCategories } from "./plus-motard";
import { categories as precisionCategories } from "./precision";
import { categories as prepaCategories } from "./prepa";
import { categories as protegemainCategories } from "./protegeMain";
import { categories as produitCategories } from "./produit-outillage";
import { categories as solutionCategories } from "./solution";

export type ProductItem = {
  id: string;                 // identifiant stable (clé ou titre)
  title: string;              // nom produit
  brand?: string;             // altlogo | alt
  description?: string;       // desc si dispo
  price?: string | number;    // déjà calculé via config[]
  image?: string;             // /images/...
  url: string;                // interne ou externe
  tags?: string[];            // pour filtres rapides
  group: string;              // d’où ça vient (competition, alldays, etc.)
  categoryId?: string;        // 50, 70… ou 500, 700…
  categoryLabel?: string;     // libellé cat
};

const ensureImg = (img?: string) =>
  img?.startsWith("/") ? img : (img ? `/images/${img}` : undefined);

const resolveUrl = (group: string, configKey: string | undefined) => {
  if (!configKey) return "#";
  if (configKey.startsWith("http") || configKey.startsWith("/")) return configKey;
  // Clés "simples" => routes internes (adapte si besoin)
  if (group === "competition") return `/config-competition?config=${encodeURIComponent(configKey)}`;
  if (group === "alldays")     return `/config?config=${encodeURIComponent(configKey)}`;
  // Accessoires/autres : par défaut on garde la clé telle quelle
  return `/${encodeURIComponent(configKey)}`;
};

type AnyCategories = { id?: string; label?: string; products: any[] }[];

function flatten(group: string, cats: AnyCategories): ProductItem[] {
  const out: ProductItem[] = [];
  for (const c of cats) {
    for (const p of c.products) {
      const brand = p.altlogo || p.alt || "";
      const id = String(p.configKey || p.title);
      out.push({
        id,
        title: p.title,
        brand,
        description: p.description,
        price: p.price,
        image: ensureImg(p.image),
        url: resolveUrl(group, p.configKey),
        tags: [group, c.id, c.label, brand, p.alt].filter(Boolean),
        group,
        categoryId: c.id,
        categoryLabel: c.label,
      });
    }
  }
  return out;
}

export function buildIndex(): ProductItem[] {
  const groups: [string, AnyCategories][] = [
    ["competition", compCategories as AnyCategories],
    ["alldays", allDaysCategories as AnyCategories],
    ["clignotant", clignoCategories as AnyCategories],
    ["eclairage", eclairageCategories as AnyCategories],
    ["entretien", entretienCategories as AnyCategories],
    ["frein", freinCategories as AnyCategories],
    ["meca", mecaCategories as AnyCategories],
    ["plusdunmotard", plusDuMotardCategories as AnyCategories],
    ["precision", precisionCategories as AnyCategories],
    ["prepa", prepaCategories as AnyCategories],
    ["protegemain", protegemainCategories as AnyCategories],
    ["produit", produitCategories as AnyCategories],
    ["solution", solutionCategories as AnyCategories],
  ];

  // Fusionne et déduplique par id
  const map = new Map<string, ProductItem>();
  for (const [group, cats] of groups) {
    for (const item of flatten(group, cats)) {
      if (!map.has(item.id)) map.set(item.id, item);
    }
  }
  return [...map.values()];
}
