/**
 * Pure pricing calculation functions.
 * Used both server-side (saving quote totals) and client-side (real-time preview).
 * All amounts are in VND (integer), rounded at each step.
 */

export type PricingTier = {
  minQuantity: number;
  maxQuantity: number | null;
  price: number;
};

export type VolumeDiscount = {
  minQuantity: number;
  discountPercent: number;
};

export type PricingProduct = {
  pricingType: "FIXED" | "TIERED";
  basePrice: number;
  pricingTiers: PricingTier[];
  volumeDiscounts: VolumeDiscount[];
};

export type QuoteItemInput = {
  unitPrice: number;
  quantity: number;
  discountPercent: number;
};

export type QuoteTotals = {
  subtotal: number;
  discountAmount: number;
  afterDiscount: number;
  vatAmount: number;
  total: number;
};

/** Get unit price based on pricing type and quantity */
export function calculateUnitPrice(
  product: PricingProduct,
  quantity: number
): number {
  if (product.pricingType === "FIXED") {
    return product.basePrice;
  }

  // TIERED: find matching tier
  const tiers = [...product.pricingTiers].sort(
    (a, b) => a.minQuantity - b.minQuantity
  );

  for (const tier of tiers) {
    const max = tier.maxQuantity ?? Infinity;
    if (quantity >= tier.minQuantity && quantity <= max) {
      return tier.price;
    }
  }

  // Fallback: last tier or basePrice
  if (tiers.length > 0) {
    return tiers[tiers.length - 1].price;
  }
  return product.basePrice;
}

/** Get discount % from volume discounts (highest applicable) */
export function calculateLineDiscount(
  product: PricingProduct,
  quantity: number,
  manualDiscount?: number
): number {
  if (manualDiscount !== undefined && manualDiscount >= 0) {
    return manualDiscount;
  }

  const applicable = product.volumeDiscounts
    .filter((d) => quantity >= d.minQuantity)
    .sort((a, b) => b.discountPercent - a.discountPercent);

  return applicable.length > 0 ? applicable[0].discountPercent : 0;
}

/** Calculate line total = unitPrice * quantity * (1 - discount/100), rounded */
export function calculateLineTotal(
  unitPrice: number,
  quantity: number,
  discountPercent: number
): number {
  return Math.round(unitPrice * quantity * (1 - discountPercent / 100));
}

/** Calculate all quote totals from line items */
export function calculateQuoteTotals(
  items: QuoteItemInput[],
  globalDiscountPercent: number = 0,
  vatPercent: number = 0,
  shippingFee: number = 0,
  otherFees: number = 0
): QuoteTotals {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + calculateLineTotal(item.unitPrice, item.quantity, item.discountPercent),
    0
  );

  const discountAmount = Math.round(subtotal * globalDiscountPercent / 100);
  const afterDiscount = subtotal - discountAmount;
  const vatAmount = Math.round(afterDiscount * vatPercent / 100);
  const total = afterDiscount + vatAmount + shippingFee + otherFees;

  return { subtotal, discountAmount, afterDiscount, vatAmount, total };
}
