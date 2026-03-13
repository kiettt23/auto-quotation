/**
 * Custom Excel renderer — loads a workbook from base64, fills placeholders,
 * inserts table rows, and returns the modified buffer.
 */

import ExcelJS from "exceljs";
import type { RenderResult } from "./types";

type ExcelPlaceholder = {
  cellRef: string;
  label: string;
  type: "text" | "number" | "date" | "currency";
  originalFormula?: string;
};

type TableColumn = {
  col: string;
  label: string;
  type: "text" | "number" | "date" | "currency";
};

type TableRegion = {
  startRow: number;
  columns: TableColumn[];
};

function formatValue(raw: string, type: ExcelPlaceholder["type"]): string | number | Date {
  if (type === "number" || type === "currency") {
    const n = Number(raw);
    return isNaN(n) ? raw : n;
  }
  if (type === "date") {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? raw : d;
  }
  return raw;
}

export async function renderExcelCustom(
  fileBase64: string,
  sheetName: string,
  placeholders: ExcelPlaceholder[],
  tableRegion: TableRegion | null,
  fieldData: Record<string, string>,
  tableRows: Record<string, string>[],
  fileName: string
): Promise<RenderResult> {
  const buffer = Buffer.from(fileBase64, "base64");
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ArrayBuffer);

  // Use named sheet or first sheet
  const ws = sheetName ? wb.getWorksheet(sheetName) ?? wb.worksheets[0] : wb.worksheets[0];
  if (!ws) throw new Error("Không tìm thấy sheet trong file Excel");

  // Fill placeholder cells
  for (const ph of placeholders) {
    const raw = fieldData[ph.cellRef];
    if (raw === undefined) continue;
    const cell = ws.getCell(ph.cellRef);
    cell.value = formatValue(raw, ph.type);
  }

  // Fill table rows — insert rows at startRow, pushing existing rows down
  if (tableRegion && tableRows.length > 0) {
    const { startRow, columns } = tableRegion;

    // Insert blank rows at startRow
    ws.spliceRows(startRow, 0, ...Array(tableRows.length).fill([]));

    tableRows.forEach((row, idx) => {
      const rowNum = startRow + idx;
      for (const col of columns) {
        const cell = ws.getCell(`${col.col}${rowNum}`);
        const raw = row[col.col] ?? "";
        cell.value = formatValue(raw, col.type);
      }
    });
  }

  const outBuffer = await wb.xlsx.writeBuffer();
  const baseName = fileName.replace(/\.(xlsx?)$/i, "");

  return {
    buffer: Buffer.from(outBuffer),
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    fileName: `${baseName}.xlsx`,
  };
}
