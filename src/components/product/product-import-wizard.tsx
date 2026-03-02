"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImportFileUploadStep } from "./import-file-upload-step";
import { ImportColumnMappingStep } from "./import-column-mapping-step";
import { ImportPreviewStep } from "./import-preview-step";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type ParsedData = {
  headers: string[];
  rows: (string | number | null)[][];
  rowCount: number;
  suggestedMapping: Record<string, number>;
};

export type MappedRow = {
  code?: string;
  name: string;
  category?: string;
  price?: number;
  unit?: string;
  description?: string;
  notes?: string;
};

export function ProductImportWizard({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(1);
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [mapping, setMapping] = useState<Record<string, number>>({});

  function handleParsed(data: ParsedData) {
    setParsed(data);
    setMapping(data.suggestedMapping);
    setStep(2);
  }

  function handleMappingConfirm(m: Record<string, number>) {
    setMapping(m);
    setStep(3);
  }

  function handleClose() {
    setStep(1);
    setParsed(null);
    setMapping({});
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import sản phẩm từ Excel</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`size-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-0.5 ${
                    s < step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {step === 1 && <ImportFileUploadStep onParsed={handleParsed} />}
        {step === 2 && parsed && (
          <ImportColumnMappingStep
            headers={parsed.headers}
            rows={parsed.rows}
            mapping={mapping}
            onBack={() => setStep(1)}
            onConfirm={handleMappingConfirm}
          />
        )}
        {step === 3 && parsed && (
          <ImportPreviewStep
            rows={parsed.rows}
            mapping={mapping}
            onBack={() => setStep(2)}
            onDone={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
