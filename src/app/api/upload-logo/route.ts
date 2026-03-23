import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/get-user-id";
import { requireSession } from "@/lib/auth/get-session";
import { listCompanies, updateCompany } from "@/services/company.service";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const userId = session.user.id;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const companyId = formData.get("companyId") as string | null;

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

    // Resolve which company to update — use provided companyId or fall back to first company
    let targetCompanyId = companyId;
    if (!targetCompanyId) {
      const companies = await listCompanies(userId);
      if (!companies.length) {
        return NextResponse.json({ error: "No company found" }, { status: 400 });
      }
      targetCompanyId = companies[0].id;
    }

    // Upload to Vercel Blob
    const blob = await put(
      `logos/${targetCompanyId}-${Date.now()}.${file.name.split(".").pop()}`,
      file,
      { access: "public" }
    );

    // Save URL to company with ownership check
    await updateCompany(targetCompanyId, userId, { logoUrl: blob.url });

    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
