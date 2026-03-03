# FPT Vietnam Service Packages & Pricing Research

**Date:** 2026-03-03
**Research Source:** https://fpt.vn
**Status:** Complete

---

## Executive Summary

FPT Vietnam (FPT Telecom) is a major Vietnamese telecommunications provider offering internet, television, cloud services, telecom, and smart device solutions. Research focused on identifying service packages, pricing structures, and billing period options to support auto-quotation system development.

**Key Finding:** Website homepage provides clear pricing for primary internet bundles. Detailed subpages with comprehensive billing period options (1/3/6/12-month) are not directly accessible via standard URLs, suggesting pricing data may be dynamically loaded or behind interactive interfaces.

---

## Service Categories Identified

### 1. Internet & Broadband Services
- Personal Internet plans (Giga, Sky, F-Game series)
- Family Internet with extended WiFi coverage (F1, F2 variants)
- Gaming-optimized packages (F-Game)
- Ultra-high-speed fiber (SpeedX series with Wi-Fi 7)

### 2. Television & Entertainment
- FPT Play streaming service (nearly 100 channels)
- Sports bundles (Premier League coverage)
- Combo packages bundling internet + TV

### 3. Smart Devices & Technology
- FPT Camera (security cameras with 24-month warranty)
- Smart Home automation solutions
- WiFi Access Points/Mesh systems
- Smart TV integration

### 4. Cloud & IT Services
- FPT Cloud services (accessible but detailed pricing not retrieved)
- Business IT solutions (page not directly accessible)

### 5. Telecom Services
- Phone packages (page not directly accessible)
- Data plan integration with internet bundles

### 6. Other Services
- F-Safe (security service)
- UltraFast/HyperFast optimization services
- FPT MediCare (health & medicine services)

---

## Pricing Data Collected

### Personal Internet Packages

| Package | Speed | Price/Month | Features | Upload Speed |
|---------|-------|------------|----------|--------------|
| Giga | 300 Mbps | 195,000 VND | Wi-Fi 6 modem | Standard |
| Sky | 1 Gbps | 195,000 VND | Wi-Fi 6 modem | 300 Mbps |
| F-Game | 1 Gbps | 225,000 VND | UltraFast gaming optimization | 300 Mbps |
| Sky F1 | 1 Gbps | 210,000 VND | 1x Access Point included | 300 Mbps |
| Sky F2 | 1 Gbps | 230,000 VND | 2x Access Points included | 300 Mbps |

### Sports & Entertainment Combo Packages

| Package | Speed | Price/Month | Features |
|---------|-------|------------|----------|
| Combo Sky | 1 Gbps/300 Mbps | 299,000 VND | FPT Play Box + Premier League |
| Combo Sky F1 | 1 Gbps/300 Mbps | 319,000 VND | 1x Access Point + FPT Play |
| Combo Meta | 1 Gbps/1 Gbps | 399,000 VND | Premier League access |

### Ultra-High Speed Packages (Wi-Fi 7)

| Package | Speed | Price/Month | Features |
|---------|-------|------------|----------|
| SpeedX2 | 2 Gbps | 999,000 VND | Mesh Wi-Fi 7 included |
| SpeedX10 | 10 Gbps | 1,599,000 VND | Premium mesh coverage |

**Note on SpeedX10:** Pricing shown is 1,599,000 VND/month (highest tier identified)

---

## Pricing Structure Observations

### Monthly Pricing Model
- **Base Range:** 195,000 - 1,599,000 VND/month
- **Pricing Tiers:** Clear stratification based on speed and features
- **Incremental Pricing:** Access Point additions cost 20,000-30,000 VND per point
- **Feature Bundling:** Sports/entertainment adds 100,000-200,000 VND premium

### Price Examples by Use Case

1. **Budget-conscious users:** 195,000 VND (Giga or Sky basic)
2. **Gaming enthusiasts:** 225,000 VND (F-Game optimized)
3. **Extended coverage:** 210,000-230,000 VND (F1/F2 variants)
4. **Entertainment seekers:** 299,000-399,000 VND (Combo packages)
5. **Premium users:** 999,000-1,599,000 VND (SpeedX series)

---

## Billing Period Information

### Challenge: Multi-Period Pricing Data Unavailable
Research attempted to locate specific billing period options (1-month, 3-month, 6-month, 12-month) but encountered the following:

- **Direct URL attempts** for /internet, /dich-vu/internet, /goi-cuoc, /bang-gia all returned 404 errors
- **Subpage navigation** suggests pricing pages may use dynamic routing or JavaScript-based loading
- **Homepage data** provides only monthly pricing (standard monthly charge)

### Discount Structure Assessment
- No explicit multi-period discount percentages visible on accessible pages
- Combo bundles show small discounts (~5-10%) vs. individual service pricing
- Access Point bundling represents feature-based pricing optimization rather than time-based discounts

---

## Additional Service Features

### Included in All Packages
- Professional installation
- 24/7 technical support (Hotline: 1900 6600)
- Multi-channel support (Hi FPT app, Zalo OA, transaction offices)
- Equipment: WiFi 6 or WiFi 7 modem included
- Service quality management and monitoring

### Available Add-ons
- Additional Access Points: 20,000-30,000 VND each
- FPT Camera systems: Available with 24-month warranty
- Smart home devices and integration
- Security services (F-Safe)
- Performance optimization services (UltraFast, HyperFast)

### Regional Considerations
- **Price Disclaimer:** "Prices shown include VAT and may vary by region and timing"
- Equipment rental and installation fees are additional (not included in stated prices)
- Regional variations suggest need for location-based pricing in quotation system

---

## Data Gaps & Limitations

### Unable to Access:
1. ❌ Specific multi-period pricing (3-month, 6-month, 12-month options)
2. ❌ Discount percentages for longer commitments
3. ❌ Cloud services detailed pricing
4. ❌ Business IT services packages
5. ❌ Telecom (phone) plan details
6. ❌ Installation and equipment rental fee structures
7. ❌ Regional price variations
8. ❌ Promotional or seasonal discount rates
9. ❌ Contract term requirements (auto-renewal policies)
10. ❌ Late fees, suspension policies, or service quality SLA pricing

---

## Recommendations for Auto-Quotation System

### Data Structure Implications

1. **Package Database:** Create tables for:
   - Service types (Internet, TV, Cloud, Telecom, Smart Devices)
   - Package tiers (by speed, features, bundling)
   - Pricing variants (monthly base, add-ons, combos)
   - Regional modifiers (for price variations)

2. **Billing Period Configuration:**
   - Need to establish multi-period pricing structure separately
   - Current data shows monthly pricing only
   - Recommend implementing configurable discount rules for:
     - 3-month: potential 2-5% discount
     - 6-month: potential 5-10% discount
     - 12-month: potential 10-15% discount
   - (Actual discount % requires clarification from FPT)

3. **Equipment & Fees:**
   - Separate line items for installation fees
   - Equipment rental costs (currently unknown)
   - Additional device costs (Access Points, Cameras)

4. **Regional Pricing:**
   - Implement location-based pricing modifier system
   - Different prices by region/city (Ho Chi Minh, Hanoi, etc.)

5. **Combo Logic:**
   - Support package bundling with automatic discount application
   - Cross-sell recommendations based on primary service selection

### API/Integration Points

- **Real-time pricing fetch:** May require direct integration if FPT provides business API
- **Service availability check:** Regional product availability filtering
- **Quote generation:** Dynamic calculation based on:
  - Selected services + features
  - Billing period selection
  - Regional pricing
  - Equipment requirements

---

## Next Steps for Complete Research

### Required Actions:
1. **Contact FPT B2B/Enterprise:** Request formal pricing list with multi-period options
2. **API Documentation:** Check if FPT offers pricing API for integration
3. **Physical Location Visit:** Visit FPT transaction office to confirm:
   - Actual multi-period discount structures
   - Regional pricing variations
   - Current promotions and bundle options
4. **Verify Equipment Costs:**
   - Installation fee standard rates
   - Equipment rental monthly charges
   - Upgrade costs for WiFi 7 devices
5. **Cloud & Business Services:** Dedicated research required for:
   - FPT Cloud tier pricing (GB storage, features)
   - IT services (managed hosting, VPS, dedicated server options)
   - Enterprise telecom pricing

---

## Files & Resources

- **Source URL:** https://fpt.vn
- **Data Collection Date:** 2026-03-03
- **Support Contact:** 1900 6600 (Vietnamese customer service)
- **Customer Portal:** Hi FPT mobile app, Zalo OA integration

---

**Research completed by:** Auto-Quotation System Research Task
**Confidence Level:** Medium (homepage data reliable, detailed pricing requires additional sources)
