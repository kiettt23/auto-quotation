import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

// POST /api/doc-template/analyze-pdf
// Accepts FormData with "file" field (.pdf)
// Returns: { pageCount, pages: [{ width, height }], fileBase64 }
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    if (!file.name.match(/\.pdf$/i)) {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();

    const pageInfo = pages.map((page) => {
      const { width, height } = page.getSize();
      return { width, height };
    });

    return NextResponse.json({
      pageCount: pages.length,
      pages: pageInfo,
      fileBase64: buffer.toString("base64"),
      fileName: file.name,
    });
  } catch (err) {
    console.error("[analyze-pdf] Error:", err);
    return NextResponse.json({ error: "Failed to analyze PDF" }, { status: 500 });
  }
}
