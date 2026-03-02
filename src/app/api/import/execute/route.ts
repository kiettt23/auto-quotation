import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

type MappedRow = {
  code?: string;
  name: string;
  category?: string;
  price?: number;
  unit?: string;
  description?: string;
  notes?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { rows } = (await req.json()) as { rows: MappedRow[] };

    if (!rows?.length) {
      return NextResponse.json({ error: "Không có dữ liệu" }, { status: 400 });
    }

    // Collect unique categories and units to auto-create
    const categoryNames = [...new Set(rows.map((r) => r.category).filter(Boolean))] as string[];
    const unitNames = [...new Set(rows.map((r) => r.unit).filter(Boolean))] as string[];

    // Fetch or create categories
    const categoryMap = new Map<string, string>();
    for (const name of categoryNames) {
      const existing = await db.category.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      });
      if (existing) {
        categoryMap.set(name.toLowerCase(), existing.id);
      } else {
        const created = await db.category.create({ data: { name } });
        categoryMap.set(name.toLowerCase(), created.id);
      }
    }

    // Fetch or create units
    const unitMap = new Map<string, string>();
    for (const name of unitNames) {
      const existing = await db.unit.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      });
      if (existing) {
        unitMap.set(name.toLowerCase(), existing.id);
      } else {
        const created = await db.unit.create({ data: { name } });
        unitMap.set(name.toLowerCase(), created.id);
      }
    }

    // Fallback IDs
    const defaultCategory = await db.category.findFirst();
    const defaultUnit = await db.unit.findFirst();
    if (!defaultCategory || !defaultUnit) {
      return NextResponse.json(
        { error: "Chưa có danh mục hoặc đơn vị tính mặc định" },
        { status: 400 }
      );
    }

    let created = 0;
    let updated = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.name) {
        errors.push({ row: i + 2, message: "Thiếu tên sản phẩm" });
        continue;
      }

      const categoryId = row.category
        ? categoryMap.get(row.category.toLowerCase()) ?? defaultCategory.id
        : defaultCategory.id;
      const unitId = row.unit
        ? unitMap.get(row.unit.toLowerCase()) ?? defaultUnit.id
        : defaultUnit.id;

      const data = {
        name: row.name,
        categoryId,
        unitId,
        basePrice: row.price ?? 0,
        pricingType: "FIXED" as const,
        description: row.description ?? "",
        notes: row.notes ?? "",
      };

      try {
        if (row.code) {
          const existing = await db.product.findUnique({
            where: { code: row.code },
          });
          if (existing) {
            await db.product.update({ where: { id: existing.id }, data });
            updated++;
          } else {
            await db.product.create({ data: { ...data, code: row.code } });
            created++;
          }
        } else {
          // Auto-generate code
          const code = `SP-${Date.now()}-${i}`;
          await db.product.create({ data: { ...data, code } });
          created++;
        }
      } catch {
        errors.push({ row: i + 2, message: "Lỗi lưu dữ liệu" });
      }
    }

    revalidatePath("/san-pham");
    return NextResponse.json({ created, updated, errors });
  } catch {
    return NextResponse.json({ error: "Lỗi import dữ liệu" }, { status: 500 });
  }
}
