import { NextRequest, NextResponse } from "next/server";
import { generatePghDeliveryOrder, type PghDeliveryOrderData } from "@/lib/pdf-layouts/pgh-delivery-order-layout";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const data: PghDeliveryOrderData = await req.json();
    const buffer = await generatePghDeliveryOrder(data);

    const safeName = (data.docNumber || "PGH").replace(/[^\w\-. ]/g, "_");

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
