"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { generateAndDownloadWord, hasWordTemplate } from "@/lib/word/generate-word-document";
import type { WordTemplateProps } from "@/lib/word/word-template-props";

interface Props {
  templateId: string;
  props: WordTemplateProps;
  fileName: string;
  onBeforeDownload?: () => Promise<void>;
  size?: "panel" | "default";
}

export function DocumentWordDownloadButton({ templateId, props, fileName, onBeforeDownload, size }: Props) {
  const [loading, setLoading] = useState(false);

  if (!hasWordTemplate(templateId)) return null;

  async function handleClick() {
    setLoading(true);
    try {
      await onBeforeDownload?.();
      await generateAndDownloadWord(templateId, props, fileName);
    } catch (e) {
      console.error("Word export error:", e);
      toast.error("Lỗi khi tạo file Word");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      size="sm"
      variant="outline"
      className={size === "panel" ? "h-7 gap-1 rounded-lg text-xs" : "gap-1.5"}
    >
      <FileText className="h-3 w-3" />
      {loading ? "Đang tạo..." : "Tải Word"}
    </Button>
  );
}
