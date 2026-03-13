/**
 * POST /api/doc-template/analyze-pdf
 * Accepts a base64-encoded PDF file and returns page dimensions for region editing.
 */

import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { getTenantContext } from "@/lib/tenant-context";

type PageInfo = {
  pageIndex: number;
  width: number;
  height: number;
};

export async function POST(req: NextRequest) {
  try {
    await getTenantContext(); // Auth guard
    const { fileBase64 } = await req.json() as { fileBase64: string };
    if (!fileBase64) {
      return NextResponse.json({ error: "fileBase64 là bắt buộc" }, { status: 400 });
    }

    const pdfBytes = Buffer.from(fileBase64, "base64");
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    const pageInfos: PageInfo[] = pages.map((page, idx) => {
      const { width, height } = page.getSize();
      return { pageIndex: idx, width, height };
    });

    return NextResponse.json({ pageCount: pages.length, pages: pageInfos });
  } catch (e) {
    console.error("[doc-template/analyze-pdf]", e);
    return NextResponse.json({ error: "Không thể phân tích file PDF" }, { status: 500 });
  }
}
