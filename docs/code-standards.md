# Code Standards & Codebase Structure

## Overview

This document defines coding standards, file organization, and architectural patterns used in Auto Quotation. All code contributions must follow these guidelines to maintain consistency and readability.

## File Organization

### Directory Structure
```
src/
├── app/                           # Next.js App Router pages
│   ├── (auth)/                    # Unprotected auth routes
│   ├── (app)/                     # Protected app routes
│   ├── api/                       # API route handlers
│   ├── layout.tsx                 # Root layout
│   └── onboarding/                # Onboarding flow
├── actions/                       # Server actions (RSC only)
├── components/                    # React components
│   ├── layout/                    # Layout & navigation
│   ├── ui/                        # shadcn/ui components
│   └── {feature}/                 # Feature-specific components
├── db/                            # Database layer
│   ├── schema/                    # Drizzle table definitions
│   └── client.ts                  # Database client
├── lib/                           # Utilities & helpers
│   ├── auth/                      # Auth helpers
│   ├── validations/               # Zod schemas
│   └── utils.ts                   # General utilities
├── services/                      # Business logic layer
├── types/                         # TypeScript types
└── .env                           # Environment variables
```

### File Naming Conventions

| File Type | Convention | Examples |
|-----------|-----------|----------|
| React components | PascalCase | `CustomerForm.tsx`, `ProductCard.tsx` |
| TypeScript/JavaScript | camelCase | `getCustomerId.ts`, `document.service.ts` |
| Folders | kebab-case | `src/app/(app)/customers`, `src/lib/auth` |
| Database schema | camelCase | `company.ts`, `customer.ts` |
| Server actions | camelCase + suffix | `customer.actions.ts` |
| Services | camelCase + suffix | `customer.service.ts` |
| Validation schemas | camelCase + suffix | `customer.schema.ts` |

### File Size Guidelines
- **Code files:** Keep under 200 lines (split if exceeds)
- **Type definitions:** No strict limit (usually 100-300 lines)
- **Documentation:** No strict limit (aim for clarity)

**When to split:**
- Component with 150+ lines → extract child components
- Service with 200+ lines → create separate service or utility
- Too many imports → likely needs restructuring

## Naming Conventions

### TypeScript Variables & Functions
```typescript
// camelCase for variables, functions, methods
const userId = "user-123";
function getUserById(id: string) { }
const getUserName = (user: User) => user.name;

// PascalCase for classes, types, interfaces
class CustomerService { }
type UserSession = { id: string; email: string };
interface Product { name: string; price: number; }

// UPPER_CASE for constants
const DEFAULT_PAGE_SIZE = 10;
const REDIRECT_ON_AUTH_ERROR = "/login";
```

### React Components
```typescript
// PascalCase for component names
export function CustomerForm() { }
export const ProductCard = () => <div />;

// camelCase for component props
interface Props {
  customerId: string;
  onSave: (data: Customer) => void;
  isLoading?: boolean;
}

// camelCase for event handlers
const handleSubmit = () => { };
const handleDeleteClick = () => { };
```

### Database Naming
```typescript
// Snake_case in PostgreSQL tables (auto-converted by Drizzle)
export const company = pgTable("company", {
  userId: text("user_id"),        // Maps to user_id column
  taxCode: text("tax_code"),      // Maps to tax_code column
});

// camelCase in TypeScript code (Drizzle converts automatically)
const customer: typeof customer.$inferSelect = {
  id: "cust-123",
  userId: "user-456",             // TypeScript name
  taxCode: "12345",
};
```

## Code Patterns

### Server Actions (RSC Pattern)
All server actions must follow this structure:

```typescript
// src/actions/customer.actions.ts
"use server";

import { requireUserId } from "@/lib/auth/get-user-id";
import { customerService } from "@/services/customer.service";
import { customerSchema } from "@/lib/validations/customer.schema";

export async function createCustomerAction(formData: FormData) {
  // 1. Get user ID (auth check)
  const userId = await requireUserId();

  // 2. Parse & validate input
  const parsed = customerSchema.createCustomerSchema.safeParse(
    Object.fromEntries(formData)
  );
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // 3. Call service
  try {
    const customer = await customerService.createCustomer(
      userId,
      parsed.data
    );

    // 4. Revalidate cache
    revalidatePath("/customers");

    return { success: true, data: customer };
  } catch (error) {
    return { error: `Failed to create customer: ${(error as Error).message}` };
  }
}
```

### Service Functions
Services are business logic layer between actions and database:

```typescript
// src/services/customer.service.ts
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { customer } from "@/db/schema/customer";
import { CustomerCreateInput } from "@/lib/validations/customer.schema";

export const customerService = {
  // List all customers for user
  async listCustomers(userId: string) {
    return db
      .select()
      .from(customer)
      .where(eq(customer.userId, userId));
  },

  // Get single customer with ownership check
  async getCustomerById(customerId: string, userId: string) {
    const result = await db
      .select()
      .from(customer)
      .where(and(
        eq(customer.id, customerId),
        eq(customer.userId, userId)
      ))
      .limit(1);

    if (!result.length) {
      throw new Error("Customer not found");
    }
    return result[0];
  },

  // Create new customer
  async createCustomer(userId: string, data: CustomerCreateInput) {
    const result = await db
      .insert(customer)
      .values({
        id: crypto.randomUUID(),
        userId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return result[0];
  },

  // Update customer with ownership check
  async updateCustomer(
    customerId: string,
    userId: string,
    data: Partial<CustomerCreateInput>
  ) {
    await this.getCustomerById(customerId, userId); // Ownership check

    const result = await db
      .update(customer)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customer.id, customerId))
      .returning();

    return result[0];
  },

  // Soft delete customer
  async deleteCustomer(customerId: string, userId: string) {
    await this.getCustomerById(customerId, userId); // Ownership check

    await db
      .update(customer)
      .set({ deletedAt: new Date() })
      .where(eq(customer.id, customerId));
  },
};
```

### React Components (Client)
```typescript
// src/components/customers/customer-form.tsx
"use client";

import { useFormStatus } from "react-dom";
import { createCustomerAction } from "@/actions/customer.actions";

interface Props {
  onSuccess?: () => void;
}

export function CustomerForm({ onSuccess }: Props) {
  const { pending } = useFormStatus();

  return (
    <form action={createCustomerAction}>
      <input
        type="text"
        name="name"
        placeholder="Customer name"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
      />
      <button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create Customer"}
      </button>
    </form>
  );
}
```

### Database Schema
```typescript
// src/db/schema/customer.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const customer = pgTable("customer", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  taxCode: text("tax_code"),
  deliveryAddress: text("delivery_address"),
  deliveryName: text("delivery_name"),
  receiverName: text("receiver_name"),
  receiverPhone: text("receiver_phone"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
```

### Validation Schemas
```typescript
// src/lib/validations/customer.schema.ts
import { z } from "zod";

export const customerBaseSchema = z.object({
  name: z.string().min(1, "Name required"),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable(),
  taxCode: z.string().optional().nullable(),
  deliveryAddress: z.string().optional().nullable(),
  deliveryName: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  receiverPhone: z.string().optional().nullable(),
});

export const customerSchema = {
  createCustomerSchema: customerBaseSchema,
  updateCustomerSchema: customerBaseSchema.partial(),
};

export type CustomerCreateInput = z.infer<
  typeof customerSchema.createCustomerSchema
>;
export type CustomerUpdateInput = z.infer<
  typeof customerSchema.updateCustomerSchema
>;
```

## Security Standards

### Authentication
```typescript
// All protected routes must use requireUserId()
import { requireUserId } from "@/lib/auth/get-user-id";

async function getDashboard() {
  const userId = await requireUserId();
  // userId verified from session, safe to use
}
```

### Data Access Control
```typescript
// Always check ownership before returning data
async function getCustomerById(customerId: string, userId: string) {
  const result = await db
    .select()
    .from(customer)
    .where(
      and(
        eq(customer.id, customerId),
        eq(customer.userId, userId)  // CRITICAL: ownership check
      )
    );

  if (!result.length) throw new Error("Not found");
  return result[0];
}
```

### Input Validation
```typescript
// Always validate with Zod before using input
export async function updateCustomerAction(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // parsed.data is now type-safe
  const result = await service.updateCustomer(id, userId, parsed.data);
}
```

### Error Handling
```typescript
// Never expose sensitive error details to client
try {
  await database.query(sql);
} catch (error) {
  console.error("DB error:", error); // Log internally
  return { error: "An error occurred. Please try again." }; // Generic message
}
```

## TypeScript Standards

### Type Definitions
```typescript
// Prefer explicit types over implicit inference
const userId: string = "user-123"; // Good
const userId = "user-123";         // OK for obvious cases

// Use type-safe database inference
type Customer = typeof customer.$inferSelect;
type NewCustomer = typeof customer.$inferInsert;

// Avoid `any` — use `unknown` if needed, then narrow
const handleData = (data: unknown) => {
  if (typeof data === "string") {
    // data is now string
  }
};
```

### Null/Undefined Handling
```typescript
// Use optional chaining
const email = customer?.email; // Safe, returns undefined if null

// Use nullish coalescing
const name = customer?.name ?? "Unknown"; // Provide default

// Avoid non-null assertions (!) unless certain
const email = customer!.email; // Use rarely, comment why if needed
```

## Component Standards

### Client Components
```typescript
// Mark with "use client" at top
"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";

// Keep client logic minimal
// Move business logic to server actions
export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const { pending } = useFormStatus();

  return (
    // Prefer form with action over useState + onClick
    <form action={submitAction}>
      {/* Inputs here */}
    </form>
  );
}
```

### Server Components
```typescript
// Default: server component (no "use client")

async function CustomerPage() {
  const userId = await requireUserId();
  const customers = await customerService.listCustomers(userId);

  return (
    <div>
      {/* Render without client-side state management */}
      {customers.map(c => <CustomerCard key={c.id} customer={c} />)}
    </div>
  );
}
```

## Testing Standards

### Unit Tests (Services)
```typescript
// src/services/__tests__/customer.service.test.ts
import { customerService } from "../customer.service";

describe("customerService", () => {
  describe("getCustomerById", () => {
    it("returns customer if ownership matches", async () => {
      const customer = await customerService.getCustomerById(
        "cust-123",
        "user-456"
      );
      expect(customer.id).toBe("cust-123");
    });

    it("throws if user doesn't own customer", async () => {
      await expect(
        customerService.getCustomerById("cust-123", "wrong-user")
      ).rejects.toThrow("not found");
    });
  });
});
```

### Integration Tests (Actions)
```typescript
// src/actions/__tests__/customer.actions.test.ts
describe("createCustomerAction", () => {
  it("creates customer and returns success", async () => {
    const formData = new FormData();
    formData.append("name", "Acme Corp");

    const result = await createCustomerAction(formData);
    expect(result.success).toBe(true);
  });

  it("returns error if validation fails", async () => {
    const formData = new FormData(); // Missing required name

    const result = await createCustomerAction(formData);
    expect(result.error).toBeDefined();
  });
});
```

## Performance Standards

### Database Queries
```typescript
// ❌ N+1 query problem
const customers = await customerService.listCustomers(userId);
for (const customer of customers) {
  const orders = await orderService.listOrdersByCustomerId(customer.id);
}

// ✅ Join or batch load
const customersWithOrders = await db
  .select()
  .from(customer)
  .leftJoin(order, eq(order.customerId, customer.id))
  .where(eq(customer.userId, userId));
```

### Component Optimization
```typescript
// ❌ Unnecessary re-renders
export function CustomerList({ customers }: Props) {
  return (
    <div>
      {customers.map(c => (
        <CustomerCard customer={c} /> // No key!
      ))}
    </div>
  );
}

// ✅ Memoized with keys
export const CustomerCard = memo(function CustomerCard({ customer }: Props) {
  return <div>{customer.name}</div>;
});

export function CustomerList({ customers }: Props) {
  return (
    <div>
      {customers.map(c => (
        <CustomerCard key={c.id} customer={c} />
      ))}
    </div>
  );
}
```

## Code Review Checklist

Before submitting a PR, verify:

- [ ] File naming follows conventions (kebab-case for folders, camelCase for TS)
- [ ] All functions have JSDoc comments for complex logic
- [ ] No `console.log` statements left (use proper logging)
- [ ] All type errors resolved (`tsc --noEmit` passes)
- [ ] All linting errors fixed (`pnpm lint`)
- [ ] Validation schemas used for all form inputs
- [ ] Database queries include ownership checks (`userId` match)
- [ ] No hardcoded IDs or values (use constants)
- [ ] Error messages are user-friendly
- [ ] Tests added for new business logic
- [ ] No `any` types without justification
- [ ] Components split if > 150 lines

## Documentation Standards

### JSDoc Comments
```typescript
/**
 * Creates a new customer for the given user.
 * @param userId - The owner user ID
 * @param data - Customer information
 * @returns The created customer
 * @throws Error if customer name is empty
 */
export async function createCustomer(
  userId: string,
  data: CustomerCreateInput
): Promise<Customer> {
  // ...
}
```

### Inline Comments
```typescript
// Use sparingly — code should be self-documenting
// Only comment WHY, not WHAT

// ❌ Bad: states the obvious
const name = customer.name; // Get customer name

// ✅ Good: explains non-obvious logic
// Filter out deleted customers only if they have pending orders
const activeCustomers = customers.filter(c =>
  !c.deletedAt || c.orders.length > 0
);
```

## Common Mistakes to Avoid

1. **Missing ownership checks** — Always verify `userId` match before returning data
2. **Hardcoded IDs** — Use environment variables or configuration
3. **Not validating input** — Every form input must pass Zod validation
4. **Exposing sensitive errors** — Log details, return generic messages to client
5. **N+1 queries** — Use joins or batch loading
6. **Console.log in production** — Remove before committing
7. **No error handling** — Wrap service calls in try-catch
8. **Missing revalidatePath** — Clear cache after mutations
9. **Type assertions with `as`** — Use type guards instead
10. **Forgetting `await`** — All async operations must be awaited

## Updating This Document

When code standards change:
1. Update this document first
2. Discuss with team
3. Apply to new code immediately
4. Refactor old code when touching files
5. Reference in code review feedback
