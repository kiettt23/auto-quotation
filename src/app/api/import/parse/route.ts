import { NextRequest, NextResponse } from "next/server";
import { parseExcelBuffer, autoDetectMapping } from "@/lib/import-excel-parser";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Chưa chọn file" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File vượt quá 5MB" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["xlsx", "xls", "csv"].includes(ext)) {
      return NextResponse.json(
        { error: "Chỉ hỗ trợ file .xlsx, .xls, .csv" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const parsed = await parseExcelBuffer(arrayBuffer);
    const mapping = autoDetectMapping(parsed.headers);

    return NextResponse.json({
      headers: parsed.headers,
      rows: parsed.rows,
      rowCount: parsed.rowCount,
      suggestedMapping: mapping,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Lỗi đọc file Excel";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
