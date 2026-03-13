import { FileText, Zap, Share2, BarChart3 } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Tạo báo giá siêu tốc",
    description: "Chọn sản phẩm từ danh mục, điền thông tin khách hàng — báo giá hoàn chỉnh trong dưới 1 phút.",
  },
  {
    icon: FileText,
    title: "Xuất PDF chuyên nghiệp",
    description: "Báo giá được xuất ra PDF với logo, màu sắc thương hiệu của bạn. Gây ấn tượng ngay từ cái nhìn đầu tiên.",
  },
  {
    icon: Share2,
    title: "Chia sẻ link công khai",
    description: "Gửi link xem báo giá trực tuyến cho khách hàng. Không cần đính kèm file, không cần cài thêm phần mềm.",
  },
  {
    icon: BarChart3,
    title: "Theo dõi trạng thái",
    description: "Biết ngay báo giá nào đã gửi, đã chấp nhận hay hết hạn. Không bỏ lỡ cơ hội nào.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-muted/30 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Tất cả những gì bạn cần</h2>
          <p className="mt-3 text-muted-foreground">
            Bộ công cụ báo giá đầy đủ, dễ dùng — không cần setup phức tạp.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border bg-background p-6 shadow-sm">
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="size-5 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
