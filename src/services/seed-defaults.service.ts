import { db } from "@/db";
import { category, unit } from "@/db/schema";
import { generateId } from "@/lib/utils/generate-id";

const DEFAULT_CATEGORIES = [
  "Ống thép",
  "Van",
  "Phụ kiện",
  "Thiết bị",
  "Khác",
];

const DEFAULT_UNITS = [
  "cái",
  "cây",
  "bộ",
  "kg",
  "m",
  "tấn",
  "hộp",
  "thùng",
];

/** Seed default categories and units for a new company */
export async function seedDefaults(companyId: string) {
  const categoryValues = DEFAULT_CATEGORIES.map((name) => ({
    id: generateId(),
    companyId,
    name,
  }));

  const unitValues = DEFAULT_UNITS.map((name) => ({
    id: generateId(),
    companyId,
    name,
  }));

  await Promise.all([
    db.insert(category).values(categoryValues),
    db.insert(unit).values(unitValues),
  ]);
}
