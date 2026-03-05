import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generatePdfOverlay } from "@/lib/generate-pdf-overlay";

type PdfRegion = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  type: "text" | "number" | "date";
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
): Promise<NextResponse> {
  const { entryId } = await params;

  const entry = await db.docEntry.findUnique({
    where: { id: entryId },
    include: { template: true },
  });

  if (!entry) {
    return NextResponse.json({ error: "DocEntry not found" }, { status: 404 });
  }

  const { template } = entry;
  const fieldData = (entry.fieldData ?? {}) as Record<string, string>;
  const safeDocNumber = entry.docNumber.replace(/[^\w\-. ]/g, "_");

  if (template.fileType !== "pdf") {
    return NextResponse.json(
      { error: "PDF export is only supported for PDF templates" },
      { status: 400 }
    );
  }

  try {
    const regions = (template.placeholders ?? []) as PdfRegion[];
    const buffer = await generatePdfOverlay(template.fileBase64, regions, fieldData);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeDocNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[doc-export/pdf] Error generating PDF:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
