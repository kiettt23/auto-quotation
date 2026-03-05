import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";

// ─── Types ───────────────────────────────────────────────────────────────────

type Placeholder = {
  cellRef: string;
  label: string;
  type: "text" | "number" | "date";
  originalFormula: string;
};

type TableColumn = {
  col: string;
  label: string;
  type: "text" | "number" | "date";
};

type TableRegion = {
  startRow: number;
  columns: TableColumn[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a column letter (A-Z, AA-ZZ) to a 1-based column index. */
function colLetterToIndex(col: string): number {
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + (col.toUpperCase().charCodeAt(i) - 64);
  }
  return index;
}

/** Parse cellRef like "C13" into { col: "C", row: 13 }. */
function parseCellRef(cellRef: string): { col: string; row: number } {
  const match = cellRef.match(/^([A-Za-z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid cellRef: ${cellRef}`);
  return { col: match[1].toUpperCase(), row: parseInt(match[2], 10) };
}

/** Convert a raw string value to the appropriate JS type. */
function convertValue(
  raw: string | undefined,
  type: "text" | "number" | "date"
): string | number | Date | null {
  if (raw === undefined || raw === null || raw === "") return null;
  if (type === "number") {
    const n = Number(raw);
    return isNaN(n) ? null : n;
  }
  if (type === "date") {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  return raw;
}

/** Set a cell's value, clearing any formula while preserving its style. */
function setCellValue(
  sheet: ExcelJS.Worksheet,
  rowIndex: number,
  colIndex: number,
  value: string | number | Date | null
): void {
  const cell = sheet.getCell(rowIndex, colIndex);
  // Snapshot style before touching value (ExcelJS may reset it on formula clear)
  const style = { ...cell.style };

  // Clear formula and assign plain value
  cell.value = value as ExcelJS.CellValue;

  // Restore style
  cell.style = style;
}

// ─── GET Handler ─────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
): Promise<NextResponse> {
  const { entryId } = await params;

  // 1. Load DocEntry with its template
  const entry = await db.docEntry.findUnique({
    where: { id: entryId },
    include: { template: true },
  });

  if (!entry) {
    return NextResponse.json({ error: "DocEntry not found" }, { status: 404 });
  }

  const { template, docNumber } = entry;
  const fieldData = (entry.fieldData ?? {}) as Record<string, string>;
  const tableRows = (entry.tableRows ?? []) as Record<string, string>[];
  const placeholders = (template.placeholders ?? []) as Placeholder[];
  const tableRegion = template.tableRegion as TableRegion | null;

  try {
    // 2. Decode base64 template to Buffer
    const fileBuffer = Buffer.from(template.fileBase64, "base64");

    // 3. Load into ExcelJS Workbook
    const workbook = new ExcelJS.Workbook();
    // Cast needed: ExcelJS types expect legacy Buffer, Node 22+ returns Buffer<ArrayBufferLike>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workbook.xlsx.load(fileBuffer as any);

    // 4. Get target worksheet
    const sheet = workbook.getWorksheet(template.sheetName);
    if (!sheet) {
      return NextResponse.json(
        { error: `Sheet "${template.sheetName}" not found in template` },
        { status: 422 }
      );
    }

    // 5. Fill placeholder cells
    for (const placeholder of placeholders) {
      const { cellRef, type } = placeholder;
      const rawValue = fieldData[cellRef];
      const value = convertValue(rawValue, type);

      if (value === null) continue;

      const { col, row } = parseCellRef(cellRef);
      const colIndex = colLetterToIndex(col);
      setCellValue(sheet, row, colIndex, value);
    }

    // 6. Fill table rows
    if (tableRegion && tableRows.length > 0) {
      const { startRow, columns } = tableRegion;

      tableRows.forEach((rowData, rowOffset) => {
        const rowIndex = startRow + rowOffset;
        for (const column of columns) {
          const rawValue = rowData[column.col];
          const value = convertValue(rawValue, column.type);
          if (value === null) continue;
          const colIndex = colLetterToIndex(column.col);
          setCellValue(sheet, rowIndex, colIndex, value);
        }
      });
    }

    // 7. Write workbook to buffer
    const outputBuffer = await workbook.xlsx.writeBuffer();

    // 8. Return as downloadable file
    const safeDocNumber = docNumber.replace(/[^\w\-. ]/g, "_");
    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${safeDocNumber}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[doc-export/excel] Error generating Excel:", err);
    return NextResponse.json(
      { error: "Failed to generate Excel file" },
      { status: 500 }
    );
  }
}
