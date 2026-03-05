import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = new ExcelJS.Workbook();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await wb.xlsx.load(buffer as any);

    const sheets = wb.worksheets.map((ws) => ws.name);

    // Analyze each sheet for formula cells
    const sheetsAnalysis = wb.worksheets.map((ws) => {
      const formulas: {
        cellRef: string;
        formula: string;
        row: number;
        col: number;
        colLetter: string;
        neighborLabel: string;
      }[] = [];

      ws.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          // Check for formulas
          const formula =
            (cell as unknown as { formula?: string }).formula || "";
          if (formula) {
            // Find neighboring label (cell to the left or above)
            let neighborLabel = "";
            // Check cell to the left
            if (colNumber > 1) {
              const leftCell = row.getCell(colNumber - 1);
              if (
                leftCell.value &&
                typeof leftCell.value === "string" &&
                !String(leftCell.value).startsWith("=")
              ) {
                neighborLabel = String(leftCell.value)
                  .replace(/\n/g, " ")
                  .trim();
              }
            }
            // If no left label, check row above
            if (!neighborLabel && rowNumber > 1) {
              const aboveRow = ws.getRow(rowNumber - 1);
              const aboveCell = aboveRow.getCell(colNumber);
              if (
                aboveCell.value &&
                typeof aboveCell.value === "string" &&
                !String(aboveCell.value).startsWith("=")
              ) {
                neighborLabel = String(aboveCell.value)
                  .replace(/\n/g, " ")
                  .trim();
              }
            }

            const colLetter = String.fromCharCode(64 + colNumber);
            formulas.push({
              cellRef: `${colLetter}${rowNumber}`,
              formula,
              row: rowNumber,
              col: colNumber,
              colLetter,
              neighborLabel,
            });
          }
        });
      });

      return {
        name: ws.name,
        maxRow: ws.rowCount,
        maxCol: ws.columnCount,
        formulas,
      };
    });

    // Return file as base64 + analysis
    const fileBase64 = buffer.toString("base64");

    return NextResponse.json({
      sheets,
      sheetsAnalysis,
      fileBase64,
      fileName: file.name,
    });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: "Failed to analyze file" },
      { status: 500 }
    );
  }
}
