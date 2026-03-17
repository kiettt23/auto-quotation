/**
 * AutoQuote Design System Tokens
 *
 * Single source of truth for all visual decisions.
 * Reference this file when building components.
 *
 * Color palette: Blue-based professional SaaS
 * Typography: Inter (Vietnamese support)
 * Density: Medium (balanced for desktop + mobile)
 */

// ─── Brand ────────────────────────────────────────
export const brand = {
  name: "AutoQuote",
  tagline: "Tạo báo giá, phiếu xuất kho, phiếu giao hàng nhanh chóng và chuyên nghiệp.",
} as const;

// ─── Color Palette ────────────────────────────────
// Using Tailwind class names for consistency
export const colors = {
  /** Primary action: buttons, active nav, links */
  primary: "blue-600",
  primaryHover: "blue-700",
  primaryLight: "blue-50",
  primaryText: "blue-600",

  /** Document type badges */
  badge: {
    quotation: { bg: "blue-50", text: "blue-600", label: "BG" },
    warehouseExport: { bg: "amber-50", text: "amber-600", label: "PXK" },
    deliveryOrder: { bg: "indigo-50", text: "indigo-600", label: "PGH" },
  },

  /** Status */
  status: {
    draft: { bg: "amber-50", text: "amber-600", label: "Nháp" },
    final: { bg: "emerald-50", text: "emerald-600", label: "Hoàn tất" },
  },

  /** Surfaces */
  pageBg: "slate-50",
  cardBg: "white",
  sidebarBg: "white",

  /** Text hierarchy */
  textPrimary: "slate-900",
  textSecondary: "slate-500",
  textMuted: "slate-400",

  /** Borders */
  border: "slate-200",
  borderLight: "slate-100",
} as const;

// ─── Typography Scale ─────────────────────────────
export const typography = {
  /** Page titles: "Trang chủ", "Sản phẩm" */
  pageTitle: "text-2xl font-bold text-slate-900",
  /** Section titles: "Tài liệu gần đây" */
  sectionTitle: "text-base font-semibold text-slate-900",
  /** Card/dialog titles */
  cardTitle: "text-lg font-semibold text-slate-900",
  /** Body text */
  body: "text-sm text-slate-700",
  /** Secondary/description text */
  secondary: "text-sm text-slate-500",
  /** Small labels, badges */
  caption: "text-xs text-slate-500",
  /** Form labels */
  label: "text-sm font-medium text-slate-700",
} as const;

// ─── Spacing ──────────────────────────────────────
export const spacing = {
  /** Page padding */
  page: "p-6 lg:p-10",
  pageX: "px-6 lg:px-10",
  pageY: "py-6 lg:py-10",
  /** Card padding */
  card: "p-5",
  /** Section gap (between major blocks) */
  sectionGap: "gap-8",
  /** Item gap (between list items, form fields) */
  itemGap: "gap-4",
  /** Tight gap (within a component) */
  tightGap: "gap-2",
} as const;

// ─── Layout ───────────────────────────────────────
export const layout = {
  sidebarWidth: "w-60",
  maxContentWidth: "max-w-5xl",
  mobileBottomNavHeight: "pb-16 lg:pb-0",
} as const;

// ─── Component Patterns ───────────────────────────
export const patterns = {
  /** Standard card */
  card: "rounded-xl border border-slate-200 bg-white",
  /** Page header row: title + action button */
  pageHeader: "flex items-center justify-between",
  /** Empty state container */
  emptyState: "flex flex-col items-center gap-4 rounded-xl border border-dashed border-slate-200 bg-white py-16",
  /** Table header row */
  tableHeader: "bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500",
  /** Table row */
  tableRow: "border-b border-slate-100 hover:bg-slate-50 transition-colors",
  /** Form field group */
  fieldGroup: "flex flex-col gap-1.5",
  /** Dialog overlay */
  dialogOverlay: "bg-black/40",
} as const;
