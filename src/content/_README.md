# Contenu (`src/content/`)

Toutes les données catalogue vivent ici, en **content collections Astro** typées
(`src/content/config.ts`). Les pages et composants n'accèdent **jamais** à
`getCollection` directement : ils passent par `src/libs/catalog.ts`.

## Collections

| Collection | Fichiers | Rôle |
|---|---|---|
| `categories/` | `<slug>.json` (imbriqué : `cycle/frein.json`) | Arbre de navigation. `layout` = `hub` \| `configs` \| `products`. |
| `products/` | `<slug>.json` | Catalogue produits (ex-`src/libs/{frein,meca,…}.ts`). |
| `engineConfigs/` | `<slug>.json` | Configs moteur Alldays + Compétition fusionnées. |
| `partners/` | `<slug>.json` | Encarts affiliés / marques et tuiles de renvoi des pages `hub`. |

## Conventions

- **Noms de champs** : anglais, `camelCase`.
- **Slugs** (= nom de fichier) : `kebab-case`, sans accent.
- **Images** : importées depuis `src/assets/images/` via le helper `image()` du
  schéma. Chemin relatif au fichier JSON (`../../assets/images/x.png`). Aucune
  chaîne `/images/...` en dur.
- **Prix** : jamais de nombre en dur. Un champ `priceKey` pointe vers une clé de
  `src/data/prices.ts` (source unique). `price` (nombre) n'est toléré que pour un
  cas exceptionnel.
- **Liens produit** (`link`) : objet discriminé
  `{ type: "external", url }` \| `{ type: "config", slug }` \| `{ type: "product", slug }`.
- **Mise en avant home** : `featured: true` (products ou engineConfigs), pas de
  liste séparée.

## Composants associés

`ProductCard`, `PartnerCard`, `CategoryHero`, `FilterBar`, `ProductGrid`,
`BackToTop`, `ConfigDetail`, `CategoryLayout` — tous dans `src/components/` /
`src/layouts/`, en Tailwind (pas de SCSS ajouté). Le filtrage réel est dans
`src/scripts/filters.ts`.
