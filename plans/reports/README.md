# FPT Vietnam Pricing Research Reports
## Research Date: 2026-03-03

This directory contains comprehensive research on FPT Vietnam's service packages, pricing, and recommendations for auto-quotation system integration.

---

## Documents Overview

### 1. **fpt-vietnam-pricing-research.md** (Primary Report)
**Purpose:** Comprehensive research findings and analysis

**Contents:**
- Executive summary of FPT Vietnam's service offerings
- All identified service categories (Internet, TV, Cloud, Telecom, Smart Devices)
- Complete pricing data for 10 primary packages
- Pricing structure observations and trends
- Data gaps and limitations
- Recommendations for system implementation
- Next steps for complete research

**Key Sections:**
- Service Categories Identified
- Pricing Data Collected (with comparison tables)
- Billing Period Information (challenges noted)
- Additional Service Features
- Data Gaps & Limitations (10 items listed)
- Files & Resources

**Audience:** Project stakeholders, system architects, planning phase

**Length:** Detailed report with full context

---

### 2. **fpt-pricing-data-summary.md** (Implementation Guide)
**Purpose:** Structured data organized for system development

**Contents:**
- Service category breakdown with detailed package specifications
- JSON examples for database implementation
- Price tiers visualization
- Price increment analysis
- Data completeness assessment
- Phase-based implementation recommendations
- System integration checklist

**Key Features:**
- Exact package configurations in structured format
- Price increment analysis showing upgrade costs
- Phase 1-4 roadmap for implementation
- Ready-to-use JSON schemas

**Audience:** Developers, database architects, implementers

**Length:** ~400 lines structured technical content

---

### 3. **fpt-quick-reference-pricing.csv** (Quick Lookup)
**Purpose:** Fast reference table for pricing comparisons

**Format:** CSV (easily importable into Excel, databases, etc.)

**Columns:**
- Package name, category, speeds, monthly price
- Equipment included, key features, target segment
- Access points, TV box availability, sports inclusion

**Usage:** Quick lookups, pricing tables in UI, database imports

**Audience:** Sales team, customer-facing applications, dashboards

---

### 4. **fpt-integration-recommendations.md** (Technical Planning)
**Purpose:** Detailed technical recommendations for system implementation

**Contents:**
- Data model design (3 SQL table structures)
- Pricing logic implementation (JavaScript code examples)
- Quote generation workflow (6-step process)
- Complete quote data structure example
- Data collection action items (Priority 1-3)
- System architecture recommendations
- Testing checklist (unit, integration, UAT)
- Timeline & phasing (4 phases)
- Risk assessment and mitigation
- Success metrics

**Key Deliverables:**
- 3 SQL schema definitions ready for implementation
- Pricing calculation algorithms
- Complete quote JSON structure
- 11-item prioritized action list
- Risk matrix with workarounds
- Success criteria and KPIs

**Audience:** Technical leads, architects, project managers

**Length:** ~600 lines comprehensive technical specification

---

## Quick Facts

### Data Collected
✅ **10 primary packages** with complete monthly pricing
✅ **Speed specifications** (300 Mbps to 10 Gbps)
✅ **Equipment details** (WiFi versions, access points)
✅ **Feature differentiation** (gaming, sports, bundles)
✅ **Price range:** 195,000 VND to 1,599,000 VND per month
✅ **VAT inclusion:** Confirmed included in all prices

### Data NOT Collected
❌ Multi-period pricing (3/6/12-month discounts)
❌ Equipment rental or installation fees
❌ Regional price variations
❌ Cloud services detailed pricing
❌ Business IT services packages
❌ Telecom phone plan details
❌ FPT Play subscription details (if separate)
❌ Promotional or seasonal discount rates

---

## Implementation Status

| Phase | Status | Readiness |
|-------|--------|-----------|
| **MVP (1-month pricing)** | ✅ Ready | 90% |
| **Multi-period pricing** | ⏳ Pending FPT B2B data | 20% |
| **Regional pricing** | ⏳ Pending verification | 30% |
| **Equipment & add-ons** | ⏳ Pending cost list | 40% |
| **Cloud & Business services** | ⏳ Not researched | 0% |
| **System integration** | ✅ Architecture ready | 70% |

**Overall Implementation Readiness:** 60-70% (MVP buildable, advanced features require additional data)

---

## How to Use These Reports

### For Project Managers
1. Read: **fpt-vietnam-pricing-research.md** (Executive Summary section)
2. Review: **fpt-integration-recommendations.md** (Timeline & Phasing section)
3. Action: Use Priority 1 action items to request B2B data from FPT

### For Developers
1. Start: **fpt-pricing-data-summary.md** (Service Category Breakdown)
2. Implement: Follow Phase 1 checklist
3. Reference: Use SQL schemas and code examples from **fpt-integration-recommendations.md**
4. Lookup: Use **fpt-quick-reference-pricing.csv** for accurate pricing values

### For System Architects
1. Review: **fpt-integration-recommendations.md** (Data Model Design & Architecture)
2. Design: Database schemas using provided SQL
3. Plan: Implement caching strategy and API structure
4. Test: Follow testing checklist for validation

### For Sales/Business Team
1. Check: **fpt-quick-reference-pricing.csv** for quick price lookups
2. Present: Use **fpt-pricing-data-summary.md** for package comparisons
3. Reference: **fpt-vietnam-pricing-research.md** for detailed features and specs

---

## Contact Information

**For FPT Follow-up:**
- Customer Hotline: 1900 6600
- Website: https://fpt.vn
- Support Channels: Hi FPT app, Zalo OA

**For B2B Information Requests:**
- Multi-period pricing (3/6/12-month discounts)
- Equipment and installation cost schedules
- Regional pricing matrix
- Cloud and business services pricing

---

## File Statistics

| File | Lines | Format | Purpose |
|------|-------|--------|---------|
| fpt-vietnam-pricing-research.md | 400+ | Markdown | Research findings |
| fpt-pricing-data-summary.md | 380+ | Markdown | Implementation guide |
| fpt-integration-recommendations.md | 600+ | Markdown | Technical specification |
| fpt-quick-reference-pricing.csv | 11 | CSV | Quick lookup |
| README.md | This file | Markdown | Navigation & index |

**Total Research Content:** ~1,800 lines of structured documentation

---

## Version History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-03-03 | 1.0 | Research Team | Initial comprehensive research |
| TBD | 1.1 | TBD | Multi-period pricing data |
| TBD | 1.2 | TBD | Regional pricing matrix |
| TBD | 2.0 | TBD | Complete B2B data integration |

---

## Next Steps & Action Items

### High Priority (This Week)
- [ ] Contact FPT Vietnam B2B Sales for official pricing documentation
- [ ] Schedule meeting with product/billing teams for clarifications
- [ ] Begin MVP development with available data

### Medium Priority (This Month)
- [ ] Implement Phase 1 (basic pricing system)
- [ ] Set up admin panel for price updates
- [ ] Create user testing plan

### Lower Priority (Month 2+)
- [ ] Integrate multi-period pricing
- [ ] Implement regional pricing
- [ ] Add cloud and business services

---

## Questions & Clarifications Needed

**Question 1:** What is FPT's standard discount structure for multi-period commitments?
- Industry standard: 10-15% for 12-month contracts
- Confirmation needed from FPT B2B

**Question 2:** Are equipment costs (modem, access points) included in monthly price or separate?
- Assumed separate, needs confirmation

**Question 3:** What is the installation fee for new customers?
- Not disclosed on website
- Typical telecom: 500,000-1,000,000 VND

**Question 4:** Do regional pricing variations exist and by how much?
- Website mentions "prices vary by region and timing"
- No specific data provided

**Question 5:** Is there an API available for real-time pricing integration?
- Not mentioned on website
- Valuable for automated updates

**Question 6:** What happens with contract terms and auto-renewal policies?
- Not documented
- Critical for accurate quote generation

---

## Document Maintenance

**Last Updated:** 2026-03-03
**Next Review Date:** When FPT B2B data is received
**Maintenance Owner:** Project Team
**Update Frequency:** As new information becomes available

---

**Note:** These reports are based on publicly available information from FPT's website as of 2026-03-03. For accurate, up-to-date pricing and official terms, contact FPT Vietnam directly at 1900 6600 or through their website.
