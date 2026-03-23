import { cn } from "@/lib/utils/cn";

type AppBrandProps = {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  variant?: "light" | "dark";
  className?: string;
};

const sizes = {
  sm: { text: "text-lg", icon: { box: "h-7 w-7 rounded-md", svg: 14 } },
  md: { text: "text-[28px]", icon: { box: "h-8 w-8 rounded-xl", svg: 18 } },
  lg: { text: "text-4xl", icon: { box: "h-20 w-20 rounded-2xl shadow-lg shadow-indigo-500/30", svg: 40 } },
};

function BrandIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="1" width="12" height="16" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M6 6h6M6 9h6M6 12h3" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="13" cy="13" r="4" fill="#6366F1" stroke="white" strokeWidth="1.5" />
      <path d="M11.5 13L12.5 14L14.5 12" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AppBrand({ size = "md", showIcon = false, variant = "dark", className }: AppBrandProps) {
  const s = sizes[size];
  const isDark = variant === "dark";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showIcon && (
        <div className={cn("flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500", s.icon.box)}>
          <BrandIcon size={s.icon.svg} />
        </div>
      )}
      <span className={cn(
        "font-poppins font-bold tracking-tight",
        isDark ? "text-white" : "text-slate-900",
        s.text,
      )}>
        autoquotation
      </span>
    </div>
  );
}
