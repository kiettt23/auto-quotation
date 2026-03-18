import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireCompanyId } from "@/lib/auth/get-company-id";
import { updateCompany } from "@/services/company.service";

export async function POST(request: Request) {
  try {
    const companyId = await requireCompanyId();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(`logos/${companyId}-${Date.now()}.${file.name.split(".").pop()}`, file, {
      access: "public",
    });

    // Save URL to company
    await updateCompany(companyId, { logoUrl: blob.url });

    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
