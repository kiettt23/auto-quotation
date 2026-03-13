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
    // ExcelJS row.values is 1-indexed — index 0 is always empty
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

/** System fields available for column mapping in the import wizard */
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

export type SystemFieldKey = (typeof SYSTEM_FIELDS)[number]["key"];

/** Auto-detect column mapping from Excel header names */
export function autoDetectMapping(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {};
  const patterns: Record<string, RegExp> = {
    code: /m[aã]|code|sku/i,
    name: /t[eê]n|name|s[aả]n\s*ph[aẩ]m/i,
    category: /danh\s*m[uụ]c|nh[oó]m|category|lo[aạ]i/i,
    price: /gi[aá]|price|đ[oơ]n\s*gi[aá]/i,
    unit: /đ[oơ]n\s*v[iị]|dvt|unit/i,
    description: /m[oô]\s*t[aả]|desc/i,
    notes: /ghi\s*ch[uú]|note/i,
  };

  for (const [field, regex] of Object.entries(patterns)) {
    const index = headers.findIndex((h) => regex.test(h));
    if (index !== -1 && !Object.values(mapping).includes(index)) {
      mapping[field] = index;
    }
  }

  return mapping;
}
