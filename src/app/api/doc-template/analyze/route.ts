/**
 * POST /api/doc-template/analyze
 * Accepts a base64-encoded Excel file and returns the list of non-empty cells
 * across all sheets for the user to pick placeholders from.
 */

import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

type CellInfo = {
  sheet: string;
  cellRef: string;
  value: string;
  hasFormula: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const { fileBase64 } = await req.json() as { fileBase64: string };
    if (!fileBase64) {
      return NextResponse.json({ error: "fileBase64 là bắt buộc" }, { status: 400 });
    }

    const buffer = Buffer.from(fileBase64, "base64");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer as unknown as ArrayBuffer);

    const sheets: string[] = [];
    const cells: CellInfo[] = [];

    wb.eachSheet((ws) => {
      sheets.push(ws.name);
      ws.eachRow((row, rowNum) => {
        row.eachCell((cell, colNum) => {
          const colLetter = ws.getColumn(colNum).letter;
          const cellRef = `${colLetter}${rowNum}`;
          const rawValue = cell.value;

          if (rawValue === null || rawValue === undefined || rawValue === "") return;

          const hasFormula = typeof rawValue === "object" && rawValue !== null && "formula" in rawValue;
          const displayValue = hasFormula
            ? String((rawValue as { formula: string; result?: unknown }).result ?? "")
            : String(rawValue);

          cells.push({
            sheet: ws.name,
            cellRef,
            value: displayValue.slice(0, 100),
            hasFormula,
          });
        });
      });
    });

    return NextResponse.json({ sheets, cells });
  } catch (e) {
    console.error("[doc-template/analyze]", e);
    return NextResponse.json({ error: "Không thể phân tích file Excel" }, { status: 500 });
  }
}
