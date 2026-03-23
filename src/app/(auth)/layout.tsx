import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="font-poppins text-2xl font-bold tracking-tight text-slate-900">
            autoquotation
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Tạo báo giá & phiếu giao hàng chuyên nghiệp
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
