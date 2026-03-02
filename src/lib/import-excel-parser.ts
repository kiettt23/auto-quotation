import ExcelJS from "exceljs";

export type ParsedExcel = {
  headers: string[];
  rows: (string | number | null)[][];
  rowCount: number;
};

/** Parse an Excel/CSV buffer and extract headers + data rows */
export async function parseExcelBuffer(buffer: ArrayBuffer): Promise<ParsedExcel> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet || sheet.rowCount === 0) {
    throw new Error("File không có dữ liệu");
  }

  const headers: string[] = [];
  const rows: (string | number | null)[][] = [];

  sheet.eachRow((row, rowNumber) => {
    const values = row.values as (string | number | null)[];
    // ExcelJS row.values is 1-indexed (index 0 is empty)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cells = values.slice(1).map((v: any) => {
      if (v === undefined || v === null) return null;
      if (typeof v === "object") {
        if ("result" in v) return String(v.result);
        if ("text" in v) return String(v.text);
        return String(v);
      }
      return v as string | number;
    });

    if (rowNumber === 1) {
      headers.push(...cells.map((c) => String(c ?? "")));
    } else {
      // Skip completely empty rows
      if (cells.some((c) => c !== null && c !== "")) {
        rows.push(cells);
      }
    }
  });

  return { headers, rows, rowCount: rows.length };
}

/** System fields available for column mapping */
export const SYSTEM_FIELDS = [
  { key: "code", label: "Mã sản phẩm" },
  { key: "name", label: "Tên sản phẩm" },
  { key: "category", label: "Danh mục" },
  { key: "price", label: "Giá bán" },
  { key: "unit", label: "Đơn vị tính" },
  { key: "description", label: "Mô tả" },
  { key: "notes", label: "Ghi chú" },
  { key: "skip", label: "-- Bỏ qua --" },
] as const;

/** Auto-detect column mapping from Excel headers */
export function autoDetectMapping(
  headers: string[]
): Record<string, number> {
  const mapping: Record<string, number> = {};
  const patterns: Record<string, RegExp> = {
    code: /m[aã]|code|sku/i,
    name: /t[eê]n|name|s[aả]n ph[aẩ]m/i,
    category: /danh m[uụ]c|nh[oó]m|category|lo[aạ]i/i,
    price: /gi[aá]|price|đ[oơ]n gi[aá]/i,
    unit: /đ[oơ]n v[iị]|dvt|unit/i,
    description: /m[oô] t[aả]|desc/i,
    notes: /ghi ch[uú]|note/i,
  };

  for (const [field, regex] of Object.entries(patterns)) {
    const index = headers.findIndex((h) => regex.test(h));
    if (index !== -1 && !Object.values(mapping).includes(index)) {
      mapping[field] = index;
    }
  }

  return mapping;
}
