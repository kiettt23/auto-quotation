# Phase 07: Pricing Engine & Utilities

## Context Links

- [Plan Overview](./plan.md)
- [Brainstorm - Pricing Models](../reports/brainstorm-auto-quotation.md#10-additional-specs)
- [Design System - VND Formatting](../reports/design-system-auto-quotation.md#2-typography)

## Overview

- **Priority:** P1 - Core business logic, must be correct and tested
- **Status:** Pending
- **Effort:** 3h
- **Description:** Pure function modules for pricing calculations, VND formatting, Vietnamese number-to-words conversion, and quote number generation. Includes unit tests.

## Key Insights

- All pricing functions are pure (no side effects, no DB calls) - easy to test and use client-side
- Pricing engine used both server-side (saving quote totals) and client-side (real-time preview)
- VND formatting: dot separator, no currency symbol in tables (1.234.567)
- Vietnamese number-to-words: custom implementation covers hang don vi through ty (billions)
- Quote number: BG-{YYYY}-{NNNN} format, sequential per year, read from Settings

## Requirements

### Functional
- `calculateUnitPrice(product, quantity)`: Return appropriate price based on pricing type (FIXED -> basePrice, TIERED -> lookup tier for quantity)
- `calculateLineDiscount(product, quantity, manualDiscount?)`: Return discount percentage (volume discount lookup OR manual override)
- `calculateLineTotal(unitPrice, quantity, discountPercent)`: Return `(price * qty) * (1 - discount/100)`
- `calculateQuoteTotals(items[], globalDiscountPercent, vatPercent, shippingFee, otherFees)`: Return `{ subtotal, discountAmount, afterDiscount, vatAmount, total }`
- `formatCurrency(amount)`: Format as VND string with dot separators
- `numberToVietnameseWords(amount)`: Convert number to Vietnamese text (e.g., "Nam muoi trieu...")
- `generateQuoteNumber(prefix, nextNumber)`: Format as "BG-2026-0042"

### Non-Functional
- All functions are pure, deterministic, side-effect-free
- Decimal precision: round to nearest VND (integer) at each calculation step
- Unit tests cover all edge cases: zero quantity, zero price, 100% discount, very large numbers, tiered pricing boundaries

## Architecture

### Module Structure

```
src/lib/
├── pricing-engine.ts           # All pricing calculation functions
├── format-currency.ts          # VND formatting
├── format-number-to-words.ts   # Number to Vietnamese words
└── generate-quote-number.ts    # Quote number generation
```

### Pricing Flow

```
Product (FIXED)     → basePrice = unitPrice
Product (TIERED)    → lookup tier where minQty <= qty <= maxQty → tier.price = unitPrice
VolumeDiscount      → lookup where qty >= minQty → max discountPercent
Manual override     → user sets discountPercent directly (overrides volume discount)

lineTotal = unitPrice * quantity * (1 - discountPercent / 100)
subtotal = sum(lineTotals)
discountAmount = subtotal * globalDiscountPercent / 100
afterDiscount = subtotal - discountAmount
vatAmount = afterDiscount * vatPercent / 100
total = afterDiscount + vatAmount + shippingFee + otherFees
```

## Related Code Files

### Files to Create

```
src/lib/
├── pricing-engine.ts
├── format-currency.ts
├── format-number-to-words.ts
├── generate-quote-number.ts
└── __tests__/
    ├── pricing-engine.test.ts
    ├── format-currency.test.ts
    ├── format-number-to-words.test.ts
    └── generate-quote-number.test.ts
```

## Implementation Steps

1. **Install test dependencies**
   ```bash
   npm install -D vitest @testing-library/react
   ```
   Configure vitest in `vitest.config.ts`

2. **Implement `pricing-engine.ts`**

   ```typescript
   // Types (can import from Prisma or define locally for pure functions)
   type PricingTier = { minQuantity: number; maxQuantity: number | null; price: number }
   type VolumeDiscount = { minQuantity: number; discountPercent: number }
   type Product = {
     pricingType: 'FIXED' | 'TIERED'
     basePrice: number
     pricingTiers: PricingTier[]
     volumeDiscounts: VolumeDiscount[]
   }
   type QuoteItem = { unitPrice: number; quantity: number; discountPercent: number; lineTotal: number }

   // calculateUnitPrice: FIXED -> basePrice; TIERED -> find tier
   // Edge: no matching tier -> return basePrice or last tier price

   // calculateLineDiscount: find highest applicable volume discount for quantity
   // If manual discount provided, use that instead

   // calculateLineTotal: round to integer VND

   // calculateQuoteTotals: aggregate all items
   ```

3. **Implement `format-currency.ts`**
   ```typescript
   export function formatCurrency(amount: number): string {
     return Math.round(amount)
       .toString()
       .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
   }
   // 1234567 -> "1.234.567"
   // 0 -> "0"
   // -1234567 -> "-1.234.567"
   ```

4. **Implement `format-number-to-words.ts`**

   Vietnamese number reading rules:
   - Units: khong, mot, hai, ba, bon, nam, sau, bay, tam, chin
   - Special: 1 in tens position = "muoi", 10 = "muoi", 15 = "muoi lam" (nam -> lam after muoi)
   - Special: 1 as unit after tens = "mot" (not "mot" in some contexts it stays)
   - Groups: nghin (thousand), trieu (million), ty (billion)
   - Read in 3-digit groups from left to right
   - Handle zero padding: 105 = "mot tram le nam", 1005 = "mot nghin khong tram le nam"

   ```typescript
   export function numberToVietnameseWords(n: number): string
   // 50083000 -> "Nam muoi trieu khong tram tam muoi ba nghin dong"
   // Always append "dong" at the end
   ```

5. **Implement `generate-quote-number.ts`**
   ```typescript
   export function generateQuoteNumber(prefix: string, nextNumber: number): string {
     const year = new Date().getFullYear()
     const resolvedPrefix = prefix.replace('{YYYY}', year.toString())
     const paddedNumber = nextNumber.toString().padStart(4, '0')
     return `${resolvedPrefix}${paddedNumber}`
   }
   // ("BG-{YYYY}-", 42) -> "BG-2026-0042"
   ```

6. **Write unit tests for pricing engine**
   - FIXED pricing: returns basePrice regardless of quantity
   - TIERED pricing: returns correct tier price for different quantities
   - TIERED pricing: boundary quantities (exact min, exact max)
   - TIERED pricing: quantity above all tiers (use last tier)
   - Volume discount: no applicable discount (qty below all thresholds)
   - Volume discount: picks highest applicable discount
   - Manual discount overrides volume discount
   - Line total calculation: basic, with discount, zero quantity
   - Quote totals: basic, with global discount, with VAT, with shipping + other fees
   - Quote totals: empty items array -> all zeros
   - Rounding: verify no floating point issues

7. **Write unit tests for format-currency**
   - Zero, small numbers, millions, billions
   - Negative numbers
   - Decimal input (should round)

8. **Write unit tests for number-to-words**
   - Single digits, teens, tens, hundreds
   - Thousands, millions, billions
   - Numbers with zeros (105, 1001, 10050)
   - The target: 50083000 = "Nam muoi trieu khong tram tam muoi ba nghin dong"
   - Zero = "Khong dong"

9. **Write unit tests for quote number generation**
   - Standard case
   - Different prefixes
   - Large numbers (9999+)

## Todo List

- [ ] Install and configure vitest
- [ ] Implement pricing-engine.ts with all 4 calculation functions
- [ ] Implement format-currency.ts
- [ ] Implement format-number-to-words.ts (Vietnamese)
- [ ] Implement generate-quote-number.ts
- [ ] Write pricing engine unit tests (12+ test cases)
- [ ] Write format-currency unit tests
- [ ] Write number-to-words unit tests (10+ test cases)
- [ ] Write quote number generation unit tests
- [ ] All tests pass

## Success Criteria

- All unit tests pass (target: 30+ test cases)
- Pricing engine handles FIXED, TIERED, and volume discount correctly
- VND formatting: 1234567 -> "1.234.567"
- Number-to-words: 50083000 -> "Nam muoi trieu khong tram tam muoi ba nghin dong"
- Quote number: "BG-{YYYY}-" + 42 -> "BG-2026-0042"
- No floating point precision issues in calculations
- Functions work in both Node.js (server) and browser (client) environments

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Vietnamese number-to-words edge cases | Incorrect words on PDF | Extensive test cases covering zeros, special rules (lam vs nam, le, linh) |
| Floating point arithmetic | Wrong totals | Always Math.round() at each step; use integer VND |
| Tiered pricing gaps | Incorrect price lookup | Validate tiers cover full range; fallback to basePrice |

## Next Steps

- Phase 08: Quote Builder imports and uses all pricing functions client-side for real-time calculation
- Phase 09: PDF export uses formatCurrency and numberToVietnameseWords
