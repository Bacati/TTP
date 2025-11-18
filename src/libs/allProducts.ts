// src/libs/allProducts.ts
import { categories as clignotantCategories } from "./clignotant";
import { categories as eclairageCategories } from "./eclairage";
import { categories as entretienCategories } from "./entretien";
import { categories as freinCategories } from "./frein";
import { categories as mecaCategories } from "./meca";
import { categories as precision } from "./precision";
import { categories as prepa } from "./prepa";
import { categories as produit } from "./produit-outillage";
import { categories as protegeMain } from "./protegeMain";
import { categories as solution } from "./solution";
import { categories as plusDunMotardCategories } from "./plus-motard";
import { categories as configCategories } from "./configurations";
import { categories as configCompetition } from "./configCompetition";

type RawCategory = {
  id?: string;
  label?: string;
  products: any[];
};

export type Product = {
  title: string;
  logo?: string;
  alt?: string;
  altlogo?: string;
  description?: string;
  typeMotor?: string;
  typeMotor1?: string;
  price?: string | number;
  image?: string;
  configKey?: string;
  source: string;
  categoryId?: string;
};

function fromCategories(
  source: string,
  cats: RawCategory[]
): Product[] {
  return cats.flatMap((cat) =>
    cat.products.map((p) => ({
      ...p,
      source,
      categoryId: cat.id,
    }))
  );
}

export const allProducts: Product[] = [
  ...fromCategories("clignotant", clignotantCategories as RawCategory[]),
  ...fromCategories("eclairage", eclairageCategories as RawCategory[]),
  ...fromCategories("entretien", entretienCategories as RawCategory[]),
  ...fromCategories("frein", freinCategories as RawCategory[]),
  ...fromCategories("meca", mecaCategories as RawCategory[]),
  ...fromCategories("plus-d-un-motard", plusDunMotardCategories as RawCategory[]),
  ...fromCategories("config-allDays", configCategories as RawCategory[]),
  ...fromCategories("config-competition", configCompetition as RawCategory[]),
  ...fromCategories("precision", precision as RawCategory[]),
  ...fromCategories("prepa", prepa as RawCategory[]),
  ...fromCategories("protegeMain", protegeMain as RawCategory[]),
  ...fromCategories("produit", produit as RawCategory[]),
  ...fromCategories("solution", solution as RawCategory[]),
];
