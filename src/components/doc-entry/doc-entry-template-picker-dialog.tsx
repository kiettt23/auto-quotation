"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type TemplateOption = {
  id: string;
  name: string;
  _count: { entries: number };
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: TemplateOption[];
};

/** Dialog for picking a template before creating a new doc entry */
export function DocEntryTemplatePickerDialog({ open, onOpenChange, templates }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>("");

  function handleConfirm() {
    if (!selectedId) return;
    onOpenChange(false);
    router.push(`/chung-tu/tao-moi?templateId=${selectedId}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Chọn mẫu chứng từ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label htmlFor="template-select">Mẫu chứng từ</Label>
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có mẫu nào. Hãy tạo mẫu chứng từ trước.
            </p>
          ) : (
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger id="template-select" className="w-full">
                <SelectValue placeholder="Chọn mẫu..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({t._count.entries} chứng từ)
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedId}>
            Tiếp theo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
