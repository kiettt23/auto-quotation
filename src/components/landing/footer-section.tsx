import Link from "next/link";
import { FileText } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="border-t bg-muted/30 px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="size-4" />
          </div>
          <span className="font-semibold">Auto Quotation</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-foreground">Đăng nhập</Link>
          <Link href="/register" className="hover:text-foreground">Đăng ký</Link>
          <a href="mailto:hello@autoquotation.vn" className="hover:text-foreground">Liên hệ</a>
        </nav>
        <p className="text-sm text-muted-foreground">
          © 2026 Auto Quotation. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
