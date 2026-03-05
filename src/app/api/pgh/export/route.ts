import { NextRequest, NextResponse } from "next/server";
import { generatePghDeliveryOrder, type PghDeliveryOrderData } from "@/lib/pdf-layouts/pgh-delivery-order-layout";

function validatePghData(data: unknown): { ok: true; data: PghDeliveryOrderData } | { ok: false; error: string } {
  if (!data || typeof data !== "object") return { ok: false, error: "Dữ liệu không hợp lệ" };

  const d = data as Record<string, unknown>;

  // Required string fields
  const requiredFields = ["docNumber", "deliveryDate"] as const;
  for (const field of requiredFields) {
    if (!d[field] || typeof d[field] !== "string" || !(d[field] as string).trim()) {
      return { ok: false, error: `Thiếu trường bắt buộc: ${field}` };
    }
  }

  // Validate date
  const dateStr = d.deliveryDate as string;
  const parsed = new Date(dateStr.includes("/") ? dateStr.split("/").reverse().join("-") : dateStr);
  if (isNaN(parsed.getTime())) {
    return { ok: false, error: "Ngày giao hàng không hợp lệ" };
  }

  // Validate items
  if (!Array.isArray(d.items) || d.items.length === 0) {
    return { ok: false, error: "Cần ít nhất 1 dòng hàng hóa" };
  }

  for (let i = 0; i < d.items.length; i++) {
    const row = d.items[i];
    if (!row || typeof row !== "object") {
      return { ok: false, error: `Dòng ${i + 1}: dữ liệu không hợp lệ` };
    }
    const { boxQty, netWeight } = row as Record<string, string>;
    if (boxQty && boxQty.trim() && isNaN(parseFloat(boxQty))) {
      return { ok: false, error: `Dòng ${i + 1}: Số thùng phải là số` };
    }
    if (netWeight && netWeight.trim() && isNaN(parseFloat(netWeight))) {
      return { ok: false, error: `Dòng ${i + 1}: Cân nặng phải là số` };
    }
  }

  return { ok: true, data: d as unknown as PghDeliveryOrderData };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const result = validatePghData(body);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const buffer = await generatePghDeliveryOrder(result.data);
    const safeName = (result.data.docNumber || "PGH").replace(/[^\w\-. ]/g, "_");

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[pgh/export] Error:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
