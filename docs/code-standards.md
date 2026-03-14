# Code Standards & Guidelines - Auto Quotation v2.0.0

Last Updated: 2026-03-14 | Version: 2.0.0

## Philosophy

Clean, readable, and maintainable code prioritizing developer experience. Follow KISS (Keep It Simple, Stupid), DRY (Don't Repeat Yourself), and YAGNI (You Aren't Gonna Need It) principles. Strong separation of concerns via service layer pattern.

## Project Structure

### File Organization

```
src/
├── app/                      # Next.js App Router (one file per route)
│   ├── (auth)/              # Login, register pages
│   ├── (dashboard)/         # Protected routes (dashboard, quotes, products, etc.)
│   ├── api/                 # API routes (export, auth, templates)
│   ├── share/               # Public quote share page
│   ├── onboarding/          # Tenant setup wizard
│   └── layout.tsx           # Root layout
├── auth/                     # Better Auth integration
│   ├── index.ts            # Server-side auth setup
│   └── client.ts           # Client-side auth helpers
├── components/              # React components (organized by domain)
│   ├── ui/                 # shadcn/ui base components
│   ├── dashboard/          # Dashboard-specific
│   ├── quote/              # Quote builder, items, preview
│   ├── product/            # Product CRUD
│   ├── customer/           # Customer CRUD
│   ├── document/           # Document templates, generation
│   ├── settings/           # Settings forms
│   └── layout/             # Navbar, sidebar
├── db/                      # Database setup
│   ├── index.ts            # Drizzle client
│   └── schema/             # 13 table definitions
├── lib/                     # Utilities, helpers, business logic
│   ├── tenant-context.ts   # Multi-tenant context extraction
│   ├── rbac.ts             # RBAC helpers (requireRole, hasPermission)
│   ├── constants.ts        # Default values
│   ├── pricing-engine.ts   # Quote pricing calculations
│   ├── template-engine/    # Template analysis, placeholders
│   ├── pdf/                # PDF generation, fonts
│   ├── validations/        # Zod schemas
│   ├── format-*.ts         # Currency, number, date formatting
│   └── __tests__/          # Unit tests
└── services/               # Business logic layer
    ├── quote-service.ts
    ├── product-service.ts
    ├── customer-service.ts
    ├── document-service.ts
    ├── template-service.ts
    ├── invite-service.ts
    ├── settings-service.ts
    └── dashboard-service.ts

File Naming:
- kebab-case: quote-builder.tsx, pricing-engine.ts, tenant-context.ts
- Descriptive: quote-items-table.tsx (not table.tsx)
- Components: PascalCase exports (QuoteBuilder), kebab-case filenames
```

### File Size Guidelines

- **Components:** < 200 lines; split if larger
- **Services:** < 250 lines; extract helper functions
- **Utilities:** < 150 lines; separate concerns
- **Type definitions:** Can be longer; group related types

### Module Organization Example

```
src/components/quote/
├── quote-builder.tsx          # Main component (80 LOC)
├── quote-items-table.tsx      # Items display (90 LOC)
├── quote-pricing-summary.tsx  # Totals section (40 LOC)
├── quote-actions.tsx          # Action buttons (30 LOC)
└── types.ts                   # Shared types

src/services/
├── quote-service.ts           # 200+ LOC, core business logic
├── product-service.ts         # 150+ LOC
└── types.ts                   # Shared types (Result<T>, etc)
```

## TypeScript Standards

### Type Definitions

```typescript
// Good: Explicit, reusable types
type QuoteItemFormData = {
  name: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
};

// Avoid: Inline object types (not reusable)
function updateItem(data: { name: string; qty: number }) {}

// Use type aliases for unions, interfaces for objects
type Status = "draft" | "sent" | "accepted" | "rejected" | "expired";
type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

interface Quote {
  id: string;
  quoteNumber: string;
  status: Status;
  items: QuoteItem[];
  total: number;
}
```

### Null/Undefined Handling

```typescript
// Prefer explicit optionality
type Product = {
  id: string;
  description?: string;      // May not exist
  deletedAt: Date | null;    // Soft delete flag
};

// Use nullish coalescing and optional chaining
const displayName = customer?.name ?? "Unknown";
const email = customer?.contact?.email;
```

### Result<T> Pattern (Error Handling)

```typescript
// Service layer return type for consistent error handling
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Service function example
export async function createQuote(input: QuoteInput): Promise<Result<Quote>> {
  try {
    const context = await getTenantContext();
    await requireRole("MEMBER");

    const quote = await db.insert(quotes).values({
      ...input,
      tenantId: context.tenantId,
    }).returning();

    return { success: true, data: quote };
  } catch (error) {
    console.error("Failed to create quote:", error);
    return { success: false, error: "Failed to create quote" };
  }
}

// Usage in Server Actions
export async function saveQuote(input: QuoteInput) {
  const result = await createQuote(input);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  revalidatePath("/quotes");
  return { success: true, quoteId: result.data.id };
}
```

## Component Standards

### Naming Conventions

```typescript
// Page components: descriptive names matching route
// src/app/(dashboard)/quotes/page.tsx → QuotesPage or export default
// src/components/quote/quote-builder.tsx → QuoteBuilder (default export)

export default function QuoteBuilder() { /* ... */ }

// Child components: descriptive, Verb+Noun pattern
function QuoteItemsTable() { /* ... */ }
function QuoteEditDialog() { /* ... */ }
function QuoteSummaryCard() { /* ... */ }

// Utility components: functional verbs
function FormErrorAlert() { /* ... */ }
function LoadingSpinner() { /* ... */ }
```

### Server vs Client Components

```typescript
// Server component (default)
// - Fetch data from database
// - Access secrets safely
// - Access tenant via getTenantContext()
// - Return to client components
async function QuotesPage() {
  const { tenantId } = await getTenantContext();
  const quotes = await db.query.quotes.findMany({
    where: eq(quotes.tenantId, tenantId),
    limit: 20,
  });
  return <QuotesClient quotes={quotes} />;
}

// Client component (interactive)
// - Use hooks (useState, useEffect, useContext)
// - Handle form submissions via Server Actions
// - Manage local state
"use client";

interface QuotesClientProps {
  quotes: Quote[];
}

export function QuotesClient({ quotes }: QuotesClientProps) {
  const [filtered, setFiltered] = useState(quotes);
  // ...
}
```

### Props Interface Pattern

```typescript
interface QuoteBuilderProps {
  quoteId: string;
  onSave: (data: QuoteFormData) => Promise<Result<void>>;
  isLoading?: boolean;
  error?: string;
}

function QuoteBuilder({ quoteId, onSave, isLoading, error }: QuoteBuilderProps) {
  // ...
}

// Destructure in function signature for clarity
// Never: ({ prop1, prop2 }) => <div>{prop1}</div>
// Why: Shows exactly what props component uses
```

## Multi-Tenant & RBAC Patterns

### Tenant Context Usage

```typescript
// In Server Action
"use server";

import { getTenantContext, requireRole } from "@/lib/tenant-context";
import { createQuote } from "@/services/quote-service";

export async function saveQuote(data: QuoteInput) {
  const { tenantId } = await getTenantContext();
  await requireRole("MEMBER");

  const result = await createQuote({
    ...data,
    tenantId, // Always add tenant context
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/quotes");
  return { success: true, quoteId: result.data.id };
}

// In Server Component
async function DashboardPage() {
  const { tenantId, role } = await getTenantContext();

  const quotes = await db.query.quotes.findMany({
    where: eq(quotes.tenantId, tenantId), // Always filter by tenant
  });

  return <DashboardClient quotes={quotes} />;
}
```

### RBAC Helpers

```typescript
// src/lib/rbac.ts
export async function requireRole(minRole: Role): Promise<void> {
  const { role } = await getTenantContext();
  const roleHierarchy = { OWNER: 4, ADMIN: 3, MEMBER: 2, VIEWER: 1 };

  if (roleHierarchy[role] < roleHierarchy[minRole]) {
    throw new Error(`Requires ${minRole} role, you are ${role}`);
  }
}

export async function hasPermission(action: string): Promise<boolean> {
  const { role } = await getTenantContext();
  const permissions = {
    OWNER: ["create", "edit", "delete", "manage_team", "delete_tenant"],
    ADMIN: ["create", "edit", "delete", "manage_team"],
    MEMBER: ["create", "edit"],
    VIEWER: ["read"],
  };
  return permissions[role]?.includes(action) ?? false;
}
```

## Database & Drizzle ORM

### Query Pattern

```typescript
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { quotes, quoteItems } from "@/db/schema";

// Good: Select specific fields, eager load relations
const quote = await db.query.quotes.findFirst({
  where: and(
    eq(quotes.id, quoteId),
    eq(quotes.tenantId, tenantId)  // Always filter by tenant!
  ),
  with: {
    items: {
      with: {
        product: {
          columns: { name: true, basePrice: true }
        }
      }
    },
    customer: true,
  }
});

// Create with relations
const newQuote = await db.insert(quotes).values({
  quoteNumber: generateNumber(),
  customerId: customer.id,
  tenantId, // Always add tenant context
  status: "DRAFT",
}).returning();

// Batch operations with pagination
const quotes = await db.query.quotes.findMany({
  where: eq(quotes.tenantId, tenantId),
  limit: 20,
  offset: 0,
  orderBy: desc(quotes.createdAt),
});
```

### Transactions

```typescript
// Multi-step operations in transaction
const result = await db.transaction(async (tx) => {
  const quote = await tx.insert(quotes).values({
    tenantId,
    quoteNumber: generateNumber(),
    customerId,
  }).returning();

  for (const itemData of items) {
    await tx.insert(quoteItems).values({
      ...itemData,
      quoteId: quote[0].id,
    });
  }

  return quote[0];
});
```

### Avoid N+1 Queries

```typescript
// Bad: N+1 query problem
const quotes = await db.query.quotes.findMany({
  where: eq(quotes.tenantId, tenantId),
});
for (const quote of quotes) {
  const items = await db.query.quoteItems.findMany({
    where: eq(quoteItems.quoteId, quote.id),
  });
  // process items
}

// Good: Use with to load relations
const quotes = await db.query.quotes.findMany({
  where: eq(quotes.tenantId, tenantId),
  with: {
    items: {
      with: { product: true }
    }
  }
});
// items already loaded, no extra queries
```

## Service Layer Pattern

### Service Structure

```typescript
// src/services/quote-service.ts

import { db } from "@/db";
import { quotes, quoteItems } from "@/db/schema";
import { getTenantContext, requireRole } from "@/lib/tenant-context";
import { calculateQuoteTotal } from "@/lib/pricing-engine";

type Result<T> = { success: true; data: T } | { success: false; error: string };

export async function createQuote(input: {
  tenantId: string;
  customerId?: string;
  items: QuoteItemInput[];
  globalDiscountPercent?: number;
  vatPercent?: number;
}): Promise<Result<Quote>> {
  try {
    await requireRole("MEMBER");

    // Validate
    if (!input.items.length) {
      return { success: false, error: "Quote must have at least one item" };
    }

    // Calculate totals
    const totals = calculateQuoteTotal(
      input.items,
      input.vatPercent ?? 10,
      input.globalDiscountPercent ?? 0
    );

    // Insert
    const quote = await db.insert(quotes).values({
      ...input,
      tenantId: input.tenantId,
      status: "DRAFT",
      total: totals.total,
    }).returning();

    return { success: true, data: quote[0] };
  } catch (error) {
    console.error("createQuote error:", error);
    return { success: false, error: error.message };
  }
}

export async function getQuote(
  quoteId: string,
  tenantId: string
): Promise<Result<Quote>> {
  try {
    const quote = await db.query.quotes.findFirst({
      where: and(eq(quotes.id, quoteId), eq(quotes.tenantId, tenantId)),
      with: { items: true, customer: true },
    });

    if (!quote) {
      return { success: false, error: "Quote not found" };
    }

    return { success: true, data: quote };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Forms & Validation

### Zod Schema Pattern

```typescript
// src/lib/validations/quote-schemas.ts
import { z } from "zod";

export const quoteItemSchema = z.object({
  name: z.string().min(1, "Item name required").max(255),
  quantity: z.coerce.number().min(0.01, "Quantity must be positive"),
  unitPrice: z.coerce.number().min(0, "Price must be non-negative"),
  discountPercent: z.coerce.number().min(0).max(100),
});

export const quoteSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(quoteItemSchema).min(1, "At least one item required"),
  globalDiscountPercent: z.coerce.number().min(0).max(100).default(0),
  vatPercent: z.coerce.number().min(0).max(100).default(10),
  shippingFee: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;
```

### Form Component with React Hook Form

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteSchema, type QuoteFormData } from "@/lib/validations/quote-schemas";
import { saveQuote } from "./actions";

interface QuoteFormProps {
  defaultValues?: Partial<QuoteFormData>;
  isLoading?: boolean;
}

export function QuoteForm({ defaultValues, isLoading }: QuoteFormProps) {
  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: defaultValues ?? { items: [] },
  });

  const handleSubmit = async (data: QuoteFormData) => {
    try {
      const result = await saveQuote(data);
      if (result.success) {
        form.reset();
      } else {
        form.setError("root", { message: result.error });
      }
    } catch (error) {
      form.setError("root", { message: "Failed to save quote" });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* form fields */}
      <button type="submit" disabled={isLoading || form.formState.isSubmitting}>
        {isLoading ? "Saving..." : "Save Quote"}
      </button>
    </form>
  );
}
```

## Error Handling

### Try-Catch in Services

```typescript
export async function createQuote(input: QuoteInput): Promise<Result<Quote>> {
  try {
    const context = await getTenantContext();
    await requireRole("MEMBER");

    // Business logic
    const quote = await db.insert(quotes).values({
      ...input,
      tenantId: context.tenantId,
    }).returning();

    return { success: true, data: quote[0] };
  } catch (error) {
    if (error instanceof Error) {
      console.error("createQuote failed:", error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error" };
  }
}
```

### Error Boundaries

```typescript
// Page-level error handling
export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Testing Standards

### Test File Organization

```
src/lib/
├── pricing-engine.ts
├── __tests__/
│   └── pricing-engine.test.ts
```

### Test Structure (Vitest)

```typescript
import { describe, it, expect } from "vitest";
import { calculateQuoteTotal } from "@/lib/pricing-engine";

describe("calculateQuoteTotal", () => {
  it("should calculate total with items and VAT", () => {
    const items = [
      { quantity: 2, unitPrice: 100, discountPercent: 0 }
    ];

    const result = calculateQuoteTotal(items, 10);

    expect(result.total).toBe(220); // (2 * 100) * 1.1
  });

  it("should handle zero items", () => {
    expect(calculateQuoteTotal([], 10).total).toBe(0);
  });
});
```

## React Patterns

### Controlled Components

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { /* ... */ }
});

return (
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <input {...form.register("name")} />
    {form.formState.errors.name && (
      <span>{form.formState.errors.name.message}</span>
    )}
  </form>
);
```

### Custom Hooks

```typescript
// Use custom hooks for reusable logic
export function useQuotePricing(items: QuoteItem[]) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(calculateQuoteTotal(items, 10));
  }, [items]);

  return { total };
}

// Usage in component
function QuoteSummary({ items }: Props) {
  const { total } = useQuotePricing(items);
  return <div>Total: {total}</div>;
}
```

### Lists and Keys

```typescript
// Always use stable, unique keys
{items.map((item) => (
  <QuoteItemRow
    key={item.id}  // Use database ID
    item={item}
    onEdit={handleEdit}
  />
))}

// Never use array index as key
{items.map((item, index) => (
  <QuoteItemRow key={index} /> // WRONG!
))}
```

## Code Review Checklist

Before committing:

- [ ] **Naming:** Clear, descriptive names for functions, variables, components
- [ ] **Types:** TypeScript strict mode, no `any` types, proper Result<T> usage
- [ ] **Tenant Isolation:** All queries filter by tenantId
- [ ] **RBAC:** requireRole() called in services for protected actions
- [ ] **Error Handling:** Try-catch blocks, proper error messages, Result<T> pattern
- [ ] **Testing:** New functions have tests, all tests pass
- [ ] **Size:** Files under size limits (components < 200, services < 250)
- [ ] **DRY:** No duplicated logic, shared code extracted to lib/
- [ ] **Performance:** No N+1 queries, eager loading used, pagination applied
- [ ] **Accessibility:** Semantic HTML, ARIA labels, keyboard navigation
- [ ] **Linting:** `pnpm lint` passes, no console warnings
- [ ] **Comments:** Complex logic documented, not obvious code

## Commit Message Standards

Follow conventional commits:

```
feat(quote): add period selector for subscription items
fix(auth): prevent session token collision
refactor(pricing): extract tiered pricing logic
docs(api): update endpoint documentation
test(quote-service): add edge case coverage

Types: feat, fix, refactor, perf, test, docs, style, chore
```

## Tools & Linting

```bash
# Check linting issues
pnpm lint

# Auto-fix issues
pnpm lint --fix

# Type check
npx tsc --noEmit

# Run tests
pnpm test
pnpm test -- --coverage
```

## Summary

Code should be clear, maintainable, and focused on separation of concerns via services. Always prioritize tenant isolation, RBAC checks, and Result<T> error handling. When in doubt, follow existing patterns in the codebase.

---

**Last Updated:** 2026-03-14 | **Next Review:** 2026-04-14
