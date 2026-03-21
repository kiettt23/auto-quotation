# Design Guidelines — autoquotation

> Single source of truth for UI patterns. All pages MUST follow these rules.

## Design System Overview

- **Font**: Plus Jakarta Sans (body), Poppins (logo only)
- **Primary**: Indigo-500 (`oklch(0.585 0.233 277)`)
- **Surface**: Slate-50 background, white cards
- **Text**: Slate-900 (heading), Slate-500 (secondary), Slate-400 (muted/label)
- **Border**: Slate-200, `rounded-2xl` for panels, `rounded-xl` for list items/inputs
- **Radius**: `--radius: 0.625rem` (10px)
- **Shadow**: `shadow-sm` on panels only
- **Focus**: `ring-2 ring-indigo-500 ring-offset-2` (global `:focus-visible`)

## Layout Pattern — Master-Detail

All CRUD pages (Companies, Customers, Products, Documents) use the same layout:

```
<div className="flex h-[calc(100vh-48px)] gap-0 px-10 py-6">
  {/* Master list */}
  <div className="... flex-3 (when detail open) / flex-1 (when closed)">
  {/* Detail panel */}
  <div className="... ml-6 flex-2 opacity-100 (open) / w-0 flex-none opacity-0 (closed)">
</div>
```

- **Animation**: `transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]`
- **Master panel**: search input + add button → separator → scrollable list
- **Detail panel**: header actions → separator → scrollable form fields

## Master List

- **Search**: `h-8 rounded-xl border-slate-200 bg-slate-50 pl-3 text-xs`
- **Add button**: `h-7 w-7 rounded-lg border border-slate-200` with hover indigo
- **List item**: `rounded-xl px-3 py-2.5`, selected = `bg-indigo-50 ring-1 ring-indigo-200`
- **Avatar badge**: `h-9 w-9 rounded-lg text-xs font-bold text-white` + entity color:
  - Companies = `bg-indigo-500`
  - Customers = `bg-emerald-500`
  - Products = `bg-amber-500`
- **Avatar fallback**: Always guard `name ? name.charAt(0).toUpperCase() : "?"`
- **Empty state**: Icon in `h-16 w-16 rounded-2xl bg-indigo-50`, title + subtitle "Nhấn + để thêm [entity] đầu tiên"

## Detail Panel Header

All action buttons in a single row:

```
[Save (flex-1)] [Action buttons...] [X close]
```

- **Save button**: `h-7 min-w-0 flex-1 gap-1 rounded-lg text-xs`
  - Dirty state: `bg-indigo-600 text-white hover:bg-indigo-700`, label = "Lưu" or "Tạo"
  - Clean state: `variant="outline"`, label = "Đã lưu", disabled
  - Pending: shows `Loader2 animate-spin`, label = "Lưu..."
- **Other buttons**: `variant="outline"` with icon + label, `h-7 px-2 text-xs`
- **Delete**: Use `<DeleteConfirmDialog>` shared component (AlertDialog, NOT native `confirm()`)
- **Close**: `<X>` icon button, `rounded-md p-1 text-slate-400`

## Form Fields

- Use `<LabeledField>` shared component for all fields
  - Label: `text-[11px] font-medium text-slate-400`
- Group fields with `<fieldset>` + `<legend>`:
  - Legend: `text-[11px] font-semibold uppercase tracking-wider text-slate-400`
- Separate groups with `<Separator className="my-3" />`
- Field spacing: `space-y-1.5` within groups
- Input height: `h-8 text-xs`
- Fixed-width fields (tax code, phone, date): use `w-28`/`w-32`/`w-36 shrink-0`
- Flexible fields: use `min-w-0 flex-1`
- **Textarea**: Always use shadcn `<Textarea>`, never raw `<textarea>`
- **Select**: Always use shadcn `<Select>` components

## Settings Page

Vertical tabs layout (not master-detail):
- Left: `w-56` tab list panel
- Right: `flex-1` content panel
- Tab item: `rounded-xl px-3 py-2.5 text-[13px]`, active = `bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200`

## Component Rules

| Need | Use | Never |
|------|-----|-------|
| Delete confirmation | `<DeleteConfirmDialog>` | `confirm()` |
| Text area | shadcn `<Textarea>` | raw `<textarea>` |
| Labels above inputs | `<LabeledField>` | inline labels |
| Dividers | shadcn `<Separator>` | `<hr>` or border hacks |
| Loading | `<Loader2 className="animate-spin">` | custom spinners |
| Toasts | `sonner` `toast.success/error` | `alert()` |

## Color Tokens (CSS Variables)

Defined in `globals.css` `:root`:
- `--primary`: indigo-500
- `--secondary`: slate-100
- `--muted`: slate-100 / slate-500
- `--accent`: indigo-50 / indigo-500
- `--destructive`: red
- `--border`: slate-200
- `--ring`: indigo-500

## Anti-Patterns (DO NOT)

- No gradients on buttons — use solid/outline only
- No `confirm()` — always `AlertDialog`
- No raw HTML form elements — use shadcn components
- No `flex-[N]` — use `flex-N` (canonical Tailwind)
- No `text-[10px]` — minimum `text-[11px]`
- No `rounded-[10px]` — use `rounded-xl`
- No inline callback definitions for `onSaved`/`onDeleted` — use named functions
- No Framer Motion — use CSS transitions
