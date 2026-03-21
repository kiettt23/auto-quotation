import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { AppBrand } from "@/components/layout/app-brand";
import { FileText, Zap, Shield } from "lucide-react";

const features = [
  { icon: FileText, color: "text-indigo-400", text: "3 loại tài liệu: Báo giá, PXK, PGH" },
  { icon: Zap, color: "text-yellow-400", text: "Tạo PDF chuyên nghiệp trong vài giây" },
  { icon: Shield, color: "text-green-400", text: "Quản lý sản phẩm, khách hàng tập trung" },
];

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
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center gap-10 bg-linear-to-br from-slate-900 via-slate-800 to-blue-900 p-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-indigo-500 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-48 w-48 rounded-full bg-indigo-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8">
          <AppBrand size="lg" showIcon />

          <div className="flex flex-col items-center gap-3">
            <p className="max-w-xs text-center text-base leading-relaxed text-slate-300">
              Tạo báo giá, phiếu xuất kho, phiếu giao hàng
              nhanh chóng và chuyên nghiệp.
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <f.icon className={`h-4 w-4 ${f.color}`} />
                </div>
                <span className="text-sm text-slate-300">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-white p-8">
        <div className="w-full max-w-100">{children}</div>
      </div>
    </div>
  );
}
