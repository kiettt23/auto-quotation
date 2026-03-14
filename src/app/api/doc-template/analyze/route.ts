/**
 * POST /api/doc-template/analyze
 * Accepts an Excel file (FormData) and returns per-sheet analysis
 * with formulas and neighbor labels for placeholder detection.
 */

import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getTenantContext } from "@/lib/tenant-context";

type FormulaInfo = {
  cellRef: string;
  formula: string;
  row: number;
  col: number;
  colLetter: string;
  neighborLabel: string;
};

type SheetAnalysis = {
  name: string;
  maxRow: number;
  maxCol: number;
  formulas: FormulaInfo[];
};

export async function POST(req: NextRequest) {
  try {
    await getTenantContext(); // Auth guard

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "File là bắt buộc" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer as unknown as ArrayBuffer);

    const sheets: string[] = [];
    const sheetsAnalysis: SheetAnalysis[] = [];

    wb.eachSheet((ws) => {
      sheets.push(ws.name);
      let maxRow = 0;
      let maxCol = 0;
      const formulas: FormulaInfo[] = [];

      ws.eachRow((row, rowNum) => {
        if (rowNum > maxRow) maxRow = rowNum;
        row.eachCell((cell, colNum) => {
          if (colNum > maxCol) maxCol = colNum;
          const rawValue = cell.value;
          if (rawValue === null || rawValue === undefined || rawValue === "") return;

          const isFormula = typeof rawValue === "object" && rawValue !== null && "formula" in rawValue;
          if (!isFormula) return;

          const colLetter = ws.getColumn(colNum).letter;
          const formula = (rawValue as { formula: string }).formula;

          // Find neighbor label: check cell to the left, then above
          let neighborLabel = "";
          const leftCell = row.getCell(colNum - 1);
          if (leftCell?.value && typeof leftCell.value === "string") {
            neighborLabel = leftCell.value.slice(0, 50);
          } else {
            // Check cell above
            const aboveRow = ws.getRow(rowNum - 1);
            const aboveCell = aboveRow?.getCell(colNum);
            if (aboveCell?.value && typeof aboveCell.value === "string") {
              neighborLabel = aboveCell.value.slice(0, 50);
            }
          }

          formulas.push({
            cellRef: `${colLetter}${rowNum}`,
            formula,
            row: rowNum,
            col: colNum,
            colLetter,
            neighborLabel,
          });
        });
      });

      sheetsAnalysis.push({ name: ws.name, maxRow, maxCol, formulas });
    });

    return NextResponse.json({ sheets, sheetsAnalysis });
  } catch (e) {
    console.error("[doc-template/analyze]", e);
    return NextResponse.json({ error: "Không thể phân tích file Excel" }, { status: 500 });
  }
}
