"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileSpreadsheet, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/empty-state";
import { deleteDocTemplate } from "@/app/(dashboard)/templates/actions";
import type { Placeholder } from "@/lib/validations/doc-template-schemas";

type DocTemplateItem = {
  id: string;
  name: string;
  description: string;
  sheetName: string;
  placeholders: Placeholder[] | unknown;
  createdAt: Date;
  _count: { entries: number };
};

type Props = {
  templates: DocTemplateItem[];
};

function TemplateCard({ template }: { template: DocTemplateItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const placeholderCount = Array.isArray(template.placeholders)
    ? (template.placeholders as Placeholder[]).length
    : 0;

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteDocTemplate(template.id);
        toast.success("Đã xóa mẫu tài liệu");
        router.refresh();
      } catch {
        toast.error("Không thể xóa mẫu tài liệu");
      }
    });
  }

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileSpreadsheet className="size-5 text-muted-foreground shrink-0" />
            <CardTitle className="truncate text-base">{template.name}</CardTitle>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="size-8" asChild>
              <Link href={`/templates/${template.id}`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive">
                  <Trash2 className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xóa mẫu tài liệu</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc muốn xóa mẫu &quot;{template.name}&quot;? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                    Xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {template.description && (
          <CardDescription className="mt-1">{template.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 pt-0">
        <Badge variant="secondary">{template.sheetName}</Badge>
        <Badge variant="outline">{placeholderCount} trường</Badge>
        <Badge variant="outline">{template._count.entries} bản ghi</Badge>
      </CardContent>
    </Card>
  );
}

export function DocTemplateListClient({ templates }: Props) {
  if (templates.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/templates/new">
              <Plus className="mr-2 size-4" />
              Tạo mẫu mới
            </Link>
          </Button>
        </div>
        <EmptyState
          icon={FileSpreadsheet}
          title="Chưa có mẫu tài liệu"
          description="Tạo mẫu đầu tiên từ file Excel của bạn"
          actionLabel="Tạo mẫu mới"
          actionHref="/templates/new"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/templates/new">
            <Plus className="mr-2 size-4" />
            Tạo mẫu mới
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
