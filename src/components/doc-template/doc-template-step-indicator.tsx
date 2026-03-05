"use client";

type Props = {
  step: number;
  steps: string[];
};

/** Horizontal step indicator showing current progress in wizard. */
export function DocTemplateStepIndicator({ step, steps }: Props) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={[
            "flex size-7 items-center justify-center rounded-full text-sm font-medium",
            i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          ].join(" ")}>
            {i + 1}
          </div>
          <span className={[
            "text-sm hidden sm:block",
            i === step ? "text-foreground font-medium" : "text-muted-foreground",
          ].join(" ")}>
            {label}
          </span>
          {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
}
