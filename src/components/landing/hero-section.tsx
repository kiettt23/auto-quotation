import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background px-6 py-24 text-center md:py-36">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
          <FileText className="size-4 text-primary" />
          Tạo báo giá chuyên nghiệp trong vài giây
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          Báo giá nhanh,<br />
          <span className="text-primary">thắng hợp đồng</span> dễ hơn
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          Auto Quotation giúp bạn tạo, quản lý và gửi báo giá đẹp mắt đến
          khách hàng — mọi lúc, mọi nơi. Không cần Excel, không mất thời gian.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href="/register">
              Bắt đầu miễn phí <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Đăng nhập</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Miễn phí mãi mãi cho cá nhân · Không cần thẻ tín dụng
        </p>
      </div>
    </section>
  );
}
