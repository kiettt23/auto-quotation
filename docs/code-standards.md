# Code Standards & Guidelines - Auto Quotation

Last Updated: 2026-03-03

## Philosophy

Clean, readable, and maintainable code that prioritizes developer experience. We follow KISS (Keep It Simple, Stupid) and DRY (Don't Repeat Yourself) principles.

## Project Structure

### File Organization

```
src/
├── app/                  # Next.js App Router - one file per route
├── components/           # React components - organized by domain
├── lib/                  # Utilities, helpers, business logic
│   ├── __tests__/       # Unit tests
│   └── validations/     # Zod schemas
└── generated/           # Prisma generated types (do not edit)

File Naming:
- kebab-case: quote-builder.tsx, pricing-engine.ts
- Descriptive names: product-import-wizard.tsx (NOT wizard.tsx)
- Component files: PascalCase content export, kebab-case filename
```

### File Size Guidelines

- **Components:** Keep under 200 lines; split into smaller components if larger
- **Utilities:** Under 150 lines; extract shared logic into separate files
- **Type definitions:** Can be longer; group related types

### Module Organization

```
src/components/quote/
├── quote-builder.tsx          # Main component (50-100 LOC)
├── quote-items-table.tsx      # Table display (80 LOC)
├── quote-pricing-summary.tsx  # Summary section (40 LOC)
├── quote-actions.tsx          # Action buttons (30 LOC)
└── types.ts                   # Shared types for quote domain
```

## TypeScript Standards

### Type Definitions

```typescript
// Good: Explicit, reusable types
type QuoteItemFormData = {
  name: string;
  quantity: number;
  unitPrice: Decimal;
  discountPercent: number;
};

// Avoid: Inline object types (not reusable)
function updateItem(data: { name: string; qty: number }) {}

// Use: Type aliases for simple cases, interfaces for complex structures
type Status = "draft" | "sent" | "accepted" | "rejected" | "expired";

interface QuoteWithItems extends Quote {
  items: QuoteItem[];
  calculatedTotal: number;
}
```

### Null/Undefined Handling

```typescript
// Prefer explicit optionality
type Product = {
  id: string;
  description?: string;  // May not exist
  deletedAt: Date | null; // Soft delete flag
};

// Use nullish coalescing
const displayName = customer?.name ?? "Unknown Customer";

// Use optional chaining
const email = customer?.contact?.email;
```

### Generics

```typescript
// Good: Generic with constraints
function findById<T extends { id: string }>(items: T[], id: string): T | null {
  return items.find(item => item.id === id) ?? null;
}

// Avoid: Unconstrained generics (too broad)
function process<T>(data: T): T { /* ... */ }
```

## Component Standards

### Naming Conventions

```typescript
// Page components: match route structure
// src/app/(dashboard)/bao-gia/page.tsx → QuoteListPage
// src/components/quote/quote-builder.tsx → QuoteBuilder (default export)

export default function QuoteBuilder() { /* ... */ }

// Child components: descriptive names
function QuoteItemsTable() { /* ... */ }
function QuoteEditDialog() { /* ... */ }
function QuoteSummary() { /* ... */ }

// Utility components: functional names with Verb+Noun pattern
function FormErrorAlert() { /* ... */ }
function LoadingSpinner() { /* ... */ }
```

### Server vs Client Components

```typescript
// Server component (default)
// - Fetch data from database
// - Load environment variables
// - Handle secrets safely
async function QuoteListPage() {
  const quotes = await db.quote.findMany();
  return <QuoteListClient quotes={quotes} />;
}

// Client component (interactive)
// - Use hooks (useState, useEffect, useContext)
// - Handle form submissions
// - Manage local state
"use client";

export function QuoteListClient({ quotes }: QuoteListClientProps) {
  const [filtered, setFiltered] = useState(quotes);
  // ...
}
```

### Props Interface Pattern

```typescript
// Define in component file or separate types.ts
interface QuoteBuilderProps {
  quoteId: string;
  onSave: (data: QuoteFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

// Usage
function QuoteBuilder({ quoteId, onSave, isLoading, error }: QuoteBuilderProps) {
  // ...
}

// Destructure in function signature
// Avoid: ({ prop1, prop2 }: Props) => <div>{prop1}</div>
// Reason: Makes it clear what props component uses
```

### Event Handler Naming

```typescript
// Prefix with 'on' for callbacks
interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  onDelete?: () => void;  // Optional callbacks
}

// Handler function naming: 'handle' + CamelCase
function ProductDialog({ onSubmit }: ProductDialogProps) {
  const handleSubmit = (data: ProductFormData) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    // cleanup
  };
}
```

## React Patterns

### Controlled Components

```typescript
// Good: Controlled input with React Hook Form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { /* ... */ }
});

return (
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <input {...form.register("name")} />
    {form.formState.errors.name && <span>{form.formState.errors.name.message}</span>}
  </form>
);

// Avoid: Manual state management for every field
const [name, setName] = useState("");
const [email, setEmail] = useState("");
```

### Hooks Usage

```typescript
// Custom hooks: useXXX naming convention
export function useQuotePricing(items: QuoteItem[]) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(calculateTotal(items));
  }, [items]);

  return { total, subtotal: calculateSubtotal(items) };
}

// Rules:
// - Only call hooks at top level of component
// - Don't call hooks conditionally
// - Extract logic into custom hooks if reused
```

### Lists and Keys

```typescript
// Always use stable, unique keys
{items.map((item) => (
  <QuoteItemRow
    key={item.id}  // Use database ID, NOT index
    item={item}
    onEdit={handleEdit}
  />
))}

// Avoid: Never use array index as key
// Why: Breaks component state when list reorders
{items.map((item, index) => (
  <QuoteItemRow key={index} /* ...wrong! */ />
))}
```

## Forms & Validation

### Zod Schema Pattern

```typescript
// Define schema in validations/ directory
import { z } from "zod";

export const productSchema = z.object({
  code: z.string()
    .min(1, "Code is required")
    .max(50, "Code too long"),
  name: z.string()
    .min(1, "Name is required"),
  basePrice: z.coerce.number()
    .min(0, "Price must be positive"),
  categoryId: z.string()
    .min(1, "Category required"),
});

export type ProductFormData = z.infer<typeof productSchema>;
```

### Form Component with React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormData } from "@/lib/validations/product-schemas";

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  defaultValues?: Partial<ProductFormData>;
  isLoading?: boolean;
}

export function ProductForm({
  onSubmit,
  defaultValues,
  isLoading
}: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues ?? {},
  });

  const handleSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      form.setError("root", { message: "Failed to save product" });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <input
        {...form.register("code")}
        placeholder="Product code"
      />
      {form.formState.errors.code && (
        <span>{form.formState.errors.code.message}</span>
      )}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

## Database & Prisma

### Query Pattern

```typescript
// Good: Select specific fields, eager load relations
const quote = await db.quote.findUnique({
  where: { id: quoteId },
  include: {
    items: {
      include: {
        product: {
          select: { name: true, basePrice: true }
        }
      }
    },
    customer: true,
  }
});

// Include related data on creation
const newQuote = await db.quote.create({
  data: {
    quoteNumber: generateNumber(),
    customerId: customer.id,
    items: {
      create: itemsData,
    }
  },
  include: { items: true }
});

// Batch operations for performance
const quotes = await db.quote.findMany({
  where: { status: "DRAFT" },
  take: 100,  // Pagination
  skip: 0,
});
```

### Transactions

```typescript
// Use transaction for multi-step operations
const result = await db.$transaction(async (tx) => {
  const quote = await tx.quote.create({
    data: quoteData,
  });

  for (const itemData of itemsData) {
    await tx.quoteItem.create({
      data: {
        ...itemData,
        quoteId: quote.id,
      }
    });
  }

  return quote;
});
```

### Avoid N+1 Queries

```typescript
// Bad: N+1 query problem
const quotes = await db.quote.findMany();
for (const quote of quotes) {
  const items = await db.quoteItem.findMany({
    where: { quoteId: quote.id }
  });
}

// Good: Use include to load relations at once
const quotes = await db.quote.findMany({
  include: { items: true }
});
```

## Error Handling

### Try-Catch Pattern

```typescript
// Server action or API route
export async function createQuote(data: QuoteFormData) {
  try {
    const quote = await db.quote.create({
      data: {
        quoteNumber: await generateQuoteNumber(),
        ...data,
      }
    });

    // Revalidate cache
    revalidatePath("/bao-gia");

    return { success: true, quoteId: quote.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { success: false, error: "Quote number already exists" };
      }
    }

    console.error("Failed to create quote:", error);
    return { success: false, error: "Internal server error" };
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
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

## Testing Standards

### Test File Naming

```
src/lib/
├── pricing-engine.ts
├── __tests__/
│   └── pricing-engine.test.ts  # Mirrors source structure
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

    const result = calculateQuoteTotal(items, 10);  // 10% VAT

    expect(result).toBe(220);  // (2 * 100) * 1.1
  });

  it("should apply global discount correctly", () => {
    const items = [
      { quantity: 1, unitPrice: 1000, discountPercent: 0 }
    ];

    const result = calculateQuoteTotal(items, 10, 20);  // 10% VAT, 20% global discount

    expect(result).toBe(880);  // (1000 * 0.8) * 1.1
  });

  it("should handle edge case with zero items", () => {
    expect(calculateQuoteTotal([], 10)).toBe(0);
  });
});
```

## Code Review Checklist

Before committing:

- [ ] **Naming:** Functions, variables, components have clear, descriptive names
- [ ] **Types:** TypeScript strict mode, no `any` types
- [ ] **Error handling:** Try-catch blocks, proper error messages
- [ ] **Testing:** New functions have tests, tests pass
- [ ] **Size:** Files under size limits (components < 200 LOC)
- [ ] **DRY:** No duplicated logic, shared code extracted
- [ ] **Performance:** No N+1 queries, lazy loading applied
- [ ] **Accessibility:** Semantic HTML, ARIA labels where needed
- [ ] **Linting:** `pnpm lint` passes
- [ ] **Comments:** Complex logic documented, not obvious code

## Commit Message Standards

Follow conventional commits:

```
type(scope): description

# Examples:
feat(quote): add period selector for subscription items
fix(import): prevent duplicate category creation
refactor(pricing): extract tiered pricing logic
docs(readme): update setup instructions
test(pricing-engine): add VAT calculation edge cases

# Types:
# - feat: New feature
# - fix: Bug fix
# - refactor: Code reorganization (no behavior change)
# - perf: Performance improvement
# - test: Test additions/improvements
# - docs: Documentation changes
# - style: Formatting (linting, semicolons, etc.)
# - chore: Dependencies, tooling
```

## Common Patterns

### Async Data Fetching in Server Component

```typescript
// src/app/(dashboard)/bao-gia/page.tsx

async function QuotePage() {
  const quotes = await db.quote.findMany({
    where: { status: "DRAFT" },
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div>
      <h1>Quotes</h1>
      <QuoteListClient quotes={quotes} />
    </div>
  );
}
```

### Form Submission with Server Action

```typescript
// Component
"use client";

import { createProduct } from "./actions";

export function ProductDialog({ onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      const result = await createProduct(data);
      if (result.success) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />;
}

// Server action
// actions.ts
"use server";

export async function createProduct(data: ProductFormData) {
  try {
    const product = await db.product.create({
      data: {
        code: data.code,
        name: data.name,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        unitId: data.unitId,
      }
    });

    revalidatePath("/san-pham");
    return { success: true, productId: product.id };
  } catch (error) {
    return { success: false, error: "Failed to create product" };
  }
}
```

### Export Component

```typescript
// src/app/api/export/pdf/[quoteId]/route.ts

import { generatePDFQuote } from "@/lib/generate-pdf-quote";

export async function GET(
  request: Request,
  { params }: { params: { quoteId: string } }
) {
  try {
    const quote = await db.quote.findUnique({
      where: { id: params.quoteId },
      include: { items: true, customer: true },
    });

    if (!quote) {
      return new Response("Quote not found", { status: 404 });
    }

    const settings = await db.settings.findUnique({
      where: { id: "default" },
    });

    const pdfBytes = await generatePDFQuote(quote, settings);

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="quote-${quote.quoteNumber}.pdf"`,
      },
    });
  } catch (error) {
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
```

## Performance Guidelines

### Database

- Use indexes on frequently queried columns
- Eager load related data with `include`
- Use pagination for large result sets
- Cache query results when appropriate

### Frontend

- Code-split components with dynamic imports
- Lazy-load images with Next.js Image
- Memoize expensive calculations with `useMemo`
- Avoid unnecessary re-renders with `React.memo`

### Caching

```typescript
// Revalidate after mutations
revalidatePath("/bao-gia");  // Revalidate specific path
revalidateTag("quotes");     // Revalidate by tag
```

## Documentation Requirements

- **Functions:** JSDoc comments for public APIs
- **Complex logic:** Inline comments explaining why, not what
- **Types:** Document union types and complex interfaces
- **Page components:** Brief comment explaining purpose

```typescript
/**
 * Calculates total price with VAT and global discounts
 * @param items - Quote line items
 * @param vatPercent - VAT percentage (0-100)
 * @param globalDiscountPercent - Discount on subtotal (0-100)
 * @returns Total amount in VND
 */
export function calculateQuoteTotal(
  items: QuoteItem[],
  vatPercent: number,
  globalDiscountPercent: number = 0
): number {
  // ...
}
```

## Tools & Linting

### ESLint Configuration

Configured in `eslint.config.mjs` with Next.js defaults.

```bash
# Check linting issues
pnpm lint

# Auto-fix issues
pnpm lint --fix
```

### TypeScript

Strict mode enabled in `tsconfig.json`:

```bash
# Type check without building
npx tsc --noEmit
```

### Testing

```bash
# Run tests with Vitest
pnpm test

# Run with coverage
pnpm test -- --coverage
```

## Summary

The goal is clean, maintainable code that's easy for any developer to understand and modify. Prioritize clarity over cleverness, and don't over-engineer. When in doubt, follow existing patterns in the codebase.
