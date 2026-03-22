# Code Standards

> Rules for writing code in autoquotation. Follow these to keep the codebase consistent.

## File Organization

### Naming

| Type | Convention | Example |
|------|-----------|---------|
| Files (JS/TS) | kebab-case | `document-form.tsx`, `company.service.ts` |
| Component exports | PascalCase | `export function DocumentForm()` |
| Folders | kebab-case | `src/app/(app)/documents` |
| DB schema files | kebab-case | `document.ts`, `company.ts` |
| Actions | `{entity}.actions.ts` | `document.actions.ts` |
| Services | `{entity}.service.ts` | `document.service.ts` |
| Validations | `{entity}.schema.ts` | `document.schema.ts` |

### File Size

- Code files: **under 200 lines** (split if exceeds)
- Split strategy: extract child components, separate services/utilities

## Patterns

### Server Actions

```typescript
"use server";

export async function createEntityAction(input: unknown): Promise<ActionResult<EntityRow>> {
  const userId = await requireUserId();        // 1. Auth
  const parsed = schema.safeParse(input);       // 2. Validate
  if (!parsed.success) return err(parsed.error.issues[0].message);
  const result = await createEntity(userId, parsed.data); // 3. Service call
  revalidatePath("/entities");                  // 4. Cache bust
  return ok(result);
}
```

Key rules:
- Always `requireUserId()` first
- Always validate with Zod
- Return `ActionResult<T>` (from `@/lib/utils/action-result`)
- Revalidate affected paths
- Generic error messages to client, log details server-side

### Services

```typescript
// Pattern: exported async functions, not class/object
export async function listEntities(userId: string) {
  return db.select().from(entity)
    .where(and(eq(entity.userId, userId), isNull(entity.deletedAt)));
}
```

- All queries filtered by `userId`
- Ownership check on get/update/delete
- Soft delete via `deletedAt`
- Return Drizzle row types

### Server Pages

```typescript
// Fetch data, pass to client component
export default async function EntitiesPage() {
  const userId = await requireUserId();
  const data = await listEntities(userId);
  return <EntityListClient data={data} />;
}
```

### Client Components

- `"use client"` at top
- State management with `useState`/`useMemo`
- Call server actions directly
- Use `toast.success/error` from sonner for feedback
- Use `router.refresh()` after mutations

## Database

### Schema

```typescript
export const entity = pgTable("entity", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  // ... fields
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

- Snake_case in DB, camelCase in TypeScript (Drizzle converts)
- Always include `userId`, `deletedAt`, `createdAt`, `updatedAt`
- Use `text("id")` primary key with `generateId()` helper

### Document Data (JSONB)

```typescript
interface DocumentData {
  // Shared fields (all templates use these)
  customerName?: string;
  items?: DocumentDataItem[];
  notes?: string;

  // Template-specific fields (NESTED, never flat)
  templateFields?: Record<string, string>;

  // Per-document column override
  columns?: ColumnDef[];
}
```

**Critical**: Template-specific fields go in `templateFields`, not as top-level fields.

## Template Registry

`src/lib/pdf/template-registry.ts` is the **single source of truth** for document types.

- No `document_type` DB table
- Adding template = add entry to registry array
- Columns, showTotal, signatureLabels, colors, extraFormFields all defined here
- UI auto-discovers templates from registry

## Validation

```typescript
// Zod schemas in src/lib/validations/
export const createEntitySchema = z.object({
  name: z.string().min(1, "Tên không được trống"),
  // ... fields
});
export type CreateEntityInput = z.infer<typeof createEntitySchema>;
```

## Security Checklist

- [ ] `requireUserId()` on all actions
- [ ] `userId` filter on all DB queries
- [ ] Zod validation on all inputs
- [ ] Ownership check before update/delete
- [ ] Generic error messages to client
- [ ] No `any` types
- [ ] No hardcoded IDs or secrets

## Anti-Patterns

- No `document_type` table/service/actions — use template registry
- No flat template-specific fields in DocumentData — use `templateFields`
- No raw HTML form elements — use shadcn components
- No `console.log` in production code
- No `as` type assertions without justification
- No N+1 queries — use joins or batch
