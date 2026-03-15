/**
 * GET /api/doc-export/excel/[documentId]
 * Renders a document as Excel and streams the file back.
 */

import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant-context";
import { getDocumentById } from "@/services/document-service";
import { getTenantSettings } from "@/services/settings-service";
import { renderDocument } from "@/lib/template-engine";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;
    const { tenantId } = await getTenantContext();

    const doc = await getDocumentById(tenantId, documentId);
    if (!doc) {
      return NextResponse.json({ error: "Không tìm thấy tài liệu" }, { status: 404 });
    }

    const tenant = await getTenantSettings(tenantId);
    if (!tenant) {
      return NextResponse.json({ error: "Không tìm thấy tenant" }, { status: 404 });
    }

    const result = await renderDocument(doc.template, doc, tenant, "excel");

    const excelMime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (result.contentType !== excelMime) {
      return NextResponse.json({ error: "Chứng từ này không phải Excel" }, { status: 400 });
    }

    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        "Content-Type": excelMime,
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
      },
    });
  } catch (e) {
    console.error("[doc-export/excel]", e);
    return NextResponse.json({ error: "Lỗi xuất Excel" }, { status: 500 });
  }
}
