"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createCompanyAction } from "./actions";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CreateCompanyPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(toSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Vui lòng nhập tên công ty");
      return;
    }
    if (slug.length < 3) {
      setError("Slug phải có ít nhất 3 ký tự");
      return;
    }

    startTransition(async () => {
      try {
        await createCompanyAction({ name: name.trim(), slug });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Quay lại Dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Tạo công ty mới</CardTitle>
            <CardDescription>
              Mỗi công ty là một không gian làm việc riêng biệt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Tên công ty</Label>
                <Input
                  id="name"
                  placeholder="Ví dụ: Công ty TNHH ABC"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  disabled={isPending}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">Đường dẫn (slug)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground shrink-0">app/</span>
                  <Input
                    id="slug"
                    placeholder="ten-cong-ty"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Chỉ chữ thường, số và dấu gạch ngang. Tối thiểu 3 ký tự.
                </p>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Đang tạo..." : "Tạo công ty"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
