/** Reusable label-above-input field wrapper used across detail panels */
export function LabeledField({
  label,
  children,
  className,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className ?? ""}`}>
      <span className="mb-0.5 block text-[11px] font-medium text-slate-400">
        {label}
      </span>
      {children}
    </div>
  );
}
