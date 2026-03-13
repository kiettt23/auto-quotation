import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Miễn phí",
    price: "0đ",
    description: "Dành cho cá nhân và freelancer",
    cta: "Bắt đầu miễn phí",
    href: "/register",
    highlight: false,
    features: [
      "Tối đa 20 báo giá / tháng",
      "1 không gian làm việc",
      "Xuất PDF cơ bản",
      "Chia sẻ link công khai",
    ],
  },
  {
    name: "Pro",
    price: "299.000đ",
    description: "Dành cho doanh nghiệp nhỏ",
    cta: "Dùng thử 14 ngày",
    href: "/register",
    highlight: true,
    features: [
      "Báo giá không giới hạn",
      "5 thành viên",
      "Mẫu PDF tùy chỉnh",
      "Thương hiệu riêng",
      "Lịch sử đầy đủ",
    ],
  },
  {
    name: "Enterprise",
    price: "Liên hệ",
    description: "Cho tổ chức lớn, nhiều chi nhánh",
    cta: "Liên hệ tư vấn",
    href: "mailto:hello@autoquotation.vn",
    highlight: false,
    features: [
      "Thành viên không giới hạn",
      "Nhiều workspace",
      "Tích hợp API",
      "Hỗ trợ ưu tiên 24/7",
    ],
  },
];

export function PricingSection() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Bảng giá đơn giản, minh bạch</h2>
          <p className="mt-3 text-muted-foreground">Không phí ẩn. Nâng cấp hoặc hủy bất cứ lúc nào.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 shadow-sm ${
                plan.highlight ? "border-primary bg-primary/5 ring-2 ring-primary" : "bg-background"
              }`}
            >
              {plan.highlight && (
                <span className="mb-3 inline-block rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  Phổ biến nhất
                </span>
              )}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <p className="mt-4 text-3xl font-bold">
                {plan.price}
                {plan.price !== "Liên hệ" && (
                  <span className="text-base font-normal text-muted-foreground"> /tháng</span>
                )}
              </p>
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={plan.highlight ? "default" : "outline"}
                className="mt-6 w-full"
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
