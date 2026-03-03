# FPT Vietnam Integration Recommendations
## For Auto-Quotation System

**Date:** 2026-03-03
**Report Type:** Implementation Guidance
**Status:** Ready for Development Planning

---

## Overview

This document provides actionable recommendations for integrating FPT Vietnam's service offerings into the auto-quotation system based on research conducted on 2026-03-03.

---

## 1. Data Model Design

### 1.1 Service Tier Structure

**Recommended approach:** Implement a 3-tier classification system

```
Tier 1: Basic Internet Services
├── Internet Giga (300 Mbps)
└── Internet Sky (1 Gbps)

Tier 2: Enhanced Services
├── Internet F-Game (Specialized)
├── Internet Sky F1 (Extended Coverage)
├── Internet Sky F2 (Extended Coverage)
└── Combo packages (Internet + Entertainment)

Tier 3: Premium Services
├── SpeedX2 (2 Gbps)
└── SpeedX10 (10 Gbps)
```

### 1.2 Package Attributes Table

```sql
CREATE TABLE fpt_packages (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  category ENUM('internet', 'bundle', 'ultra_premium'),
  speed_download_mbps INT,
  speed_upload_mbps INT,
  monthly_price_vnd INT,
  equipment_included JSON,
  features JSON,
  target_segment VARCHAR(50),
  access_points_included INT DEFAULT 0,
  includes_tv_box BOOLEAN DEFAULT FALSE,
  includes_sports BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.3 Pricing Variants Table

```sql
CREATE TABLE fpt_pricing_variants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  package_id VARCHAR(50),
  billing_period_days INT,  -- 30, 90, 180, 365 (TBD)
  discount_percentage DECIMAL(5,2),  -- TBD pending B2B data
  total_price_vnd INT,  -- Calculated: monthly * months - discount
  region VARCHAR(50),  -- TBD: North/Central/South
  created_at TIMESTAMP,
  FOREIGN KEY (package_id) REFERENCES fpt_packages(id)
);
```

### 1.4 Add-ons & Equipment Table

```sql
CREATE TABLE fpt_addons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  type ENUM('equipment', 'service', 'installation'),
  description TEXT,
  one_time_cost_vnd INT,  -- Installation, equipment purchase
  monthly_cost_vnd INT,   -- Equipment rental
  available_with ARRAY(VARCHAR(50)), -- Package compatibility
  created_at TIMESTAMP
);
```

---

## 2. Pricing Logic Implementation

### 2.1 Base Quote Calculation

```javascript
function calculateBaseQuote(packageId, billingPeriodDays = 30) {
  const pkg = getPackage(packageId);
  const monthsToCharge = Math.ceil(billingPeriodDays / 30);

  const basePrice = pkg.monthly_price_vnd * monthsToCharge;
  const discount = getDiscount(billingPeriodDays);
  const finalPrice = basePrice * (1 - discount);

  return {
    base_price: basePrice,
    discount_amount: basePrice * discount,
    discount_percentage: discount * 100,
    final_price: Math.round(finalPrice),
    billing_period_days: billingPeriodDays
  };
}
```

### 2.2 Add-ons Calculation

```javascript
function addEquipmentAndServices(quoteId, addons = []) {
  let quote = getQuote(quoteId);
  let additionalCost = 0;

  addons.forEach(addon => {
    const addonData = getAddon(addon.id);

    // One-time costs (installation, equipment)
    if (addonData.one_time_cost_vnd) {
      additionalCost += addonData.one_time_cost_vnd;
    }

    // Monthly rental costs
    if (addonData.monthly_cost_vnd && quote.billing_period_days) {
      const months = Math.ceil(quote.billing_period_days / 30);
      additionalCost += addonData.monthly_cost_vnd * months;
    }
  });

  quote.addons_total = additionalCost;
  quote.total_price = quote.final_price + additionalCost;

  return quote;
}
```

### 2.3 Regional Pricing Modifier

```javascript
function applyRegionalPricing(packageId, region) {
  const pkg = getPackage(packageId);
  const regionModifier = getRegionModifier(region);

  // Modifier example:
  // North (Hanoi): 1.0
  // Central (Da Nang): 1.05
  // South (HCMC): 1.08
  // Remote: 1.15 or unavailable

  return {
    ...pkg,
    monthly_price_vnd: Math.round(pkg.monthly_price_vnd * regionModifier),
    region_applied: region,
    modifier: regionModifier
  };
}
```

---

## 3. Quote Generation Workflow

### 3.1 Recommended Flow for Quote Creation

```
Step 1: Customer selects service category
  → Display available packages in tier 1

Step 2: Customer selects specific package
  → Show speed/features/price comparison
  → Highlight recommended add-ons

Step 3: Customer selects billing period
  → Display monthly equivalent pricing
  → Show total price with discount breakdown
  → (NOTE: Multi-period pricing TBD - show 1-month only for now)

Step 4: Customer selects region (if applicable)
  → Recalculate pricing with regional modifier
  → Show availability confirmation

Step 5: Customer adds optional services
  → Equipment upgrades (Access Points, etc.)
  → Installation services
  → Additional features

Step 6: System generates quote
  → Summary of all selections
  → Price breakdown by category
  → Total monthly and period costs
  → T&C acknowledgment
  → Print/Email/PDF export options
```

### 3.2 Quote Data Structure

```json
{
  "quote_id": "QT-FPT-2026-0001",
  "created_at": "2026-03-03T10:30:00Z",
  "expires_at": "2026-03-10T10:30:00Z",
  "customer_info": {
    "name": "Customer Name",
    "email": "email@example.com",
    "phone": "0987654321",
    "region": "HCMC",
    "address": "Full address"
  },
  "selected_package": {
    "id": "internet_sky",
    "name": "Internet Sky",
    "monthly_price": 195000,
    "billing_period_days": 30
  },
  "pricing_breakdown": {
    "base_monthly": 195000,
    "total_for_period": 195000,
    "discount_applied": 0,
    "discount_amount": 0,
    "regional_modifier": 1.0,
    "subtotal": 195000
  },
  "addons": [
    {
      "id": "addon_access_point",
      "name": "WiFi Access Point",
      "one_time_cost": 0,
      "monthly_cost": 0,
      "total_cost": 0
    }
  ],
  "services": [
    {
      "name": "Installation Service",
      "cost": 500000,
      "type": "one_time"
    }
  ],
  "summary": {
    "monthly_recurring": 195000,
    "one_time_costs": 500000,
    "total_first_month": 695000,
    "total_for_contract_period": 695000,
    "notes": "Price includes VAT. Equipment rental fees apply based on service usage."
  },
  "validity": {
    "valid_until": "2026-03-10",
    "contract_term_months": 12,
    "auto_renewal": true
  }
}
```

---

## 4. Data Collection Action Items

### 4.1 Priority 1: Complete FPT Integration (Required for MVP)

- [ ] **Obtain B2B Pricing List**
  - Contact: FPT Vietnam B2B Sales
  - Goal: Get official document with multi-period pricing (3/6/12-month)
  - Discount percentages for longer commitments
  - Installation and equipment rental fee schedules

- [ ] **Clarify Multi-Period Pricing Strategy**
  - Research competitor models (Viettel, Mobifone, etc.)
  - Determine if 3-month = 3 × monthly price, or discounted
  - Typical industry: 12-month = 10-15% discount
  - Get FPT's official policy

- [ ] **Equipment & Installation Costs**
  - Access Point standalone purchase price
  - WiFi 7 modem upgrade cost
  - Standard installation fee
  - Equipment rental monthly charges
  - Rush/expedited installation fees

### 4.2 Priority 2: Regional Implementation

- [ ] **Regional Pricing Verification**
  - Confirm price differences by region (North/Central/South)
  - Document any service unavailability by region
  - Map all service areas within Vietnam
  - Create regional pricing lookup table

- [ ] **Service Availability Matrix**
  - Which packages available in which regions?
  - Coverage maps for fiber vs. other technologies
  - Blackout areas or service limitations

### 4.3 Priority 3: Advanced Features

- [ ] **FPT Play Details**
  - Exact pricing if purchased separately
  - Channel list and content offerings
  - Premium sports tier pricing
  - Standalone vs. bundle pricing

- [ ] **Cloud & Business Services**
  - FPT Cloud storage tiers and pricing
  - Managed hosting options
  - VPS or dedicated server offerings
  - Enterprise IT consulting rates

- [ ] **Promotional Campaigns**
  - Current active promotions
  - Seasonal discounts (Q1, Q4, etc.)
  - New customer first-month discounts
  - Loyalty program details

---

## 5. System Architecture Recommendations

### 5.1 Database Design Approach

**Option A: Normalized (Recommended for flexibility)**
- Separate tables for packages, pricing, addons, regions
- Easily accommodates future changes and new providers
- More queries but cleaner data integrity

**Option B: Denormalized (Faster queries)**
- Store computed prices directly
- Requires careful cache invalidation
- Better for high-traffic scenarios

**Recommendation:** Use Option A with Redis caching layer

### 5.2 API Structure (if building REST API)

```
GET /api/fpt/packages                    # List all packages
GET /api/fpt/packages/{id}               # Package details
GET /api/fpt/packages/region/{region}    # Regional availability
POST /api/quotes/generate                # Create quote
GET /api/quotes/{quote_id}               # Retrieve quote
POST /api/quotes/{quote_id}/pdf          # Export as PDF
GET /api/pricing/multi-period/{pkg_id}   # Multi-period pricing (TBD)
```

### 5.3 Caching Strategy

```javascript
// Cache pricing data with 6-hour TTL
const cacheKey = `fpt:packages:${region}:${version}`;
const cachedData = cache.get(cacheKey);

if (!cachedData) {
  const freshData = fetchFromDatabase();
  cache.set(cacheKey, freshData, 3600 * 6); // 6 hours
  return freshData;
}

return cachedData;
```

---

## 6. Testing Checklist

### Unit Tests
- [ ] Quote calculation for each package
- [ ] Regional pricing modifier application
- [ ] Multi-period discount calculation
- [ ] Add-on cost computation
- [ ] VAT inclusion verification

### Integration Tests
- [ ] End-to-end quote generation
- [ ] Database persistence and retrieval
- [ ] Regional data filtering
- [ ] PDF export functionality
- [ ] Email delivery of quotes

### User Acceptance Tests
- [ ] Quote accuracy vs. manual calculation
- [ ] Regional pricing correctness
- [ ] Performance (quote generation < 2 seconds)
- [ ] UI/UX responsiveness
- [ ] Mobile compatibility

---

## 7. Timeline & Phasing

### Phase 1: MVP (1-2 weeks)
- Implement basic pricing for 10 packages
- Single-period (monthly) billing only
- Single region support (HCMC default)
- Basic quote generation and PDF export

### Phase 2: Enhanced (2-3 weeks)
- Multi-period pricing (3/6/12-month with TBD discounts)
- Regional pricing implementation
- Equipment and add-ons support
- Email/Print quote delivery

### Phase 3: Advanced (3-4 weeks)
- Cloud services and business packages
- FPT Play details and integration
- Promotional campaign management
- Admin panel for price management
- Analytics and reporting

### Phase 4: Integration (2-3 weeks)
- FPT API integration (if available)
- Real-time pricing sync
- Order processing integration
- Customer portal integration

---

## 8. Known Limitations & Workarounds

| Issue | Current Status | Workaround | Final Solution |
|-------|---|---|---|
| Multi-period pricing | Unknown | Show only 1-month pricing for MVP | Contact FPT B2B for official rates |
| Regional variations | Not documented | Single price for all regions | Collect from FPT support |
| Installation fees | Unknown | Add $0 as placeholder, update later | Get from FPT B2B pricing |
| Equipment rental | Unknown | Include in monthly price (TBD) | Clarify with FPT billing dept |
| FPT Play pricing | Unclear | Show as bundle only, not standalone | Contact FPT Play product team |
| Cloud services | Not accessible | Exclude from initial launch | Dedicated research phase |

---

## 9. Success Metrics

### System Performance
- Quote generation: < 2 seconds
- PDF generation: < 5 seconds
- Page load time: < 3 seconds

### Data Quality
- Pricing accuracy: 100% match with FPT official rates
- Regional coverage: 95%+ of Vietnam covered
- Update frequency: Daily sync with FPT data (future)

### User Experience
- Quote completion rate: > 80%
- Error rate on quote generation: < 0.5%
- Customer satisfaction score: > 4.5/5

---

## 10. Risk Assessment

### High Risk
- **Multi-period pricing not available** → Implement default 10-15% discount
- **Regional pricing not documented** → Start with single pricing, gather feedback
- **FPT API not available** → Maintain manual CSV import process

### Medium Risk
- **Equipment costs inflated if not verified** → Request official price list
- **Service availability blackouts** → Add user-facing availability checker
- **Promotional campaigns frequent** → Implement quick-update mechanism

### Low Risk
- **Monthly pricing changes** → Set up email alerts for FPT pricing announcements
- **New packages introduced** → Admin panel for easy package addition
- **Regional expansion** → Database design already supports new regions

---

## 11. Next Steps

**Immediate (This week):**
1. Submit request to FPT Vietnam B2B Sales for:
   - Official multi-period pricing rates
   - Installation and equipment cost schedule
   - Regional pricing matrix
   - Service availability by area

2. Schedule call with FPT Product team to discuss:
   - API availability for pricing integration
   - Promotional campaign calendar
   - Contract terms and conditions
   - SLA and billing details

**Short-term (Next 2 weeks):**
3. Develop MVP with available data
4. Set up placeholder values for TBD pricing
5. Create admin interface for price updates
6. Begin user testing with sample customers

**Medium-term (Month 1):**
7. Integrate multi-period pricing once data received
8. Implement regional pricing based on verified data
9. Add equipment and installation cost lines
10. Optimize for performance and caching

---

## Appendix: Pricing Research Sources

**Primary Source:** https://fpt.vn (Homepage - 2026-03-03)
**Available Data:** 10 package configurations with monthly pricing
**Missing Data:** Multi-period options, regional variations, equipment costs
**Quality Level:** HIGH for monthly pricing, MEDIUM for completeness, LOW for advanced data

**Contact Information for Follow-up:**
- **Customer Hotline:** 1900 6600
- **Website:** https://fpt.vn
- **Support Channels:** Hi FPT app, Zalo OA

---

**Document prepared:** 2026-03-03
**Review status:** Ready for architecture planning
**Implementation readiness:** 70% (pending B2B data)
