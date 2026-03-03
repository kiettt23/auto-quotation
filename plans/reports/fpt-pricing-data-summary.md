# FPT Vietnam Pricing Data Summary
## For Auto-Quotation System Integration

**Date:** 2026-03-03
**Format:** Structured data for system implementation

---

## Service Category Breakdown

### CATEGORY 1: Internet & Broadband

#### 1.1 Personal Internet - Standard Speed
```
Package: Internet Giga
- Speed: 300 Mbps download, standard upload
- Monthly Price: 195,000 VND
- Equipment: Wi-Fi 6 modem included
- Target Users: Basic browsing, streaming, light usage
- Equipment Rental: Unknown
- Installation: Unknown
```

#### 1.2 Personal Internet - Gigabit Speed
```
Package: Internet Sky
- Speed: 1 Gbps download, 300 Mbps upload
- Monthly Price: 195,000 VND
- Equipment: Wi-Fi 6 modem included
- Target Users: General users, multi-device households
- Note: Same price as Giga but significantly faster
```

#### 1.3 Personal Internet - Gaming Optimized
```
Package: Internet F-Game
- Speed: 1 Gbps download, 300 Mbps upload
- Monthly Price: 225,000 VND (+30,000 vs Sky)
- Equipment: Wi-Fi 6 modem, UltraFast gaming optimization
- Target Users: Gamers, low-latency requirement
- Additional Service: UltraFast optimization included
```

#### 1.4 Family Internet - Extended Coverage F1
```
Package: Internet Sky F1
- Speed: 1 Gbps download, 300 Mbps upload
- Monthly Price: 210,000 VND (+15,000 vs Sky)
- Equipment: Wi-Fi 6 modem + 1 Access Point
- Target Users: Larger homes, multiple device areas
- Accessory: 1 WiFi Access Point value
```

#### 1.5 Family Internet - Extended Coverage F2
```
Package: Internet Sky F2
- Speed: 1 Gbps download, 300 Mbps upload
- Monthly Price: 230,000 VND (+35,000 vs Sky)
- Equipment: Wi-Fi 6 modem + 2 Access Points
- Target Users: Large homes, maximum coverage
- Accessory: 2 WiFi Access Points value
```

### CATEGORY 2: Internet + Entertainment Combos

#### 2.1 Standard Combo with Sports
```
Package: Combo Sky
- Internet Speed: 1 Gbps / 300 Mbps
- Monthly Price: 299,000 VND (+104,000 vs Sky alone)
- Includes: FPT Play Box, Premier League sports access
- Equipment: Wi-Fi 6 modem, FPT TV Box
- Target Users: Sports & streaming enthusiasts
- Value Analysis: Internet (195,000) + FPT Play (est. 100,000+) = ~295,000
```

#### 2.2 Combo with Access Point & Sports
```
Package: Combo Sky F1
- Internet Speed: 1 Gbps / 300 Mbps
- Monthly Price: 319,000 VND
- Includes: 1 Access Point + FPT Play Box + Premier League
- Equipment: Wi-Fi 6 modem, 1 AP, TV Box
- Target Users: Sports fans wanting extended coverage
- Comparison: Combo Sky (299,000) + F1 upgrade (20,000) = 319,000
```

#### 2.3 Premium Combo - Symmetric Speed + Sports
```
Package: Combo Meta
- Internet Speed: 1 Gbps symmetric (both directions)
- Monthly Price: 399,000 VND
- Includes: Premier League sports access, high upload for content creation
- Equipment: Wi-Fi 7 modem, TV Box
- Target Users: Content creators, sports fans, professional usage
- Upgrade Cost: +200,000 vs standard Combo Sky (likely premium network)
```

### CATEGORY 3: Ultra-High Speed (Wi-Fi 7 Fiber)

#### 3.1 High-Speed Mesh Network
```
Package: SpeedX2
- Speed: 2 Gbps symmetric (down/up)
- Monthly Price: 999,000 VND
- Equipment: Mesh Wi-Fi 7 system included
- Target Users: Enterprise, high-demand households, 4K streaming
- Network Type: XGS-PON fiber technology
- Price per Mbps: ~499 VND/Mbps (benchmark: Sky = 195 VND/Mbps)
```

#### 3.2 Maximum Speed Flagship
```
Package: SpeedX10
- Speed: 10 Gbps symmetric (down/up)
- Monthly Price: 1,599,000 VND
- Equipment: Premium mesh Wi-Fi 7 system
- Target Users: Enterprise, data centers, professional content creation
- Network Type: XGS-PON premium fiber
- Price per Mbps: ~160 VND/Mbps (better per-unit cost than SpeedX2)
```

---

## Pricing Architecture

### Price Tiers Visualization

```
Entry Level:        195,000 VND (Giga)
                    195,000 VND (Sky) ← Best value
Specialization:     225,000 VND (F-Game) +30,000
Family Plans:       210,000 VND (Sky F1) +15,000
                    230,000 VND (Sky F2) +35,000
Bundles:            299,000 VND (Combo Sky) +104,000
                    319,000 VND (Combo Sky F1) +124,000
                    399,000 VND (Combo Meta) +204,000
Premium Fiber:      999,000 VND (SpeedX2) +804,000
                    1,599,000 VND (SpeedX10) +1,404,000
```

### Price Increment Analysis

| Upgrade Type | Cost Difference | Value Driver |
|---|---|---|
| Giga → Sky | 0 VND | Same price, 3x faster |
| Sky → F-Game | +30,000 | Gaming optimization |
| Sky → Sky F1 | +15,000 | 1 Access Point |
| Sky → Sky F2 | +35,000 | 2 Access Points |
| Sky → Combo Sky | +104,000 | FPT Play + TV Box |
| Combo Sky → Combo Meta | +100,000 | Symmetric speed upgrade |
| Sky → SpeedX2 | +804,000 | 2 Gbps speed + WiFi 7 |
| SpeedX2 → SpeedX10 | +600,000 | 10 Gbps total speed |

---

## Data Completeness Assessment

### Available Data ✅
- Monthly pricing for 10 primary packages
- Speed specifications (download/upload)
- Equipment included with each package
- Basic feature differentiation
- Service categories
- VAT inclusion confirmation

### Missing Data ❌
- Multi-period pricing (3, 6, 12-month options)
- Discount percentage structures
- Equipment rental fees
- Installation costs
- Regional price variations
- Contract terms and conditions
- Promotion/seasonal rates
- FPT Play subscription details (pricing, channel count)
- Cloud services pricing
- Business/IT services packages
- Telecom (phone) package details

---

## Implementation Recommendations

### Phase 1: Core Data Structure
```json
{
  "service_provider": "FPT Vietnam",
  "currency": "VND",
  "data_source": "https://fpt.vn (2026-03-03)",
  "pricing_period": "monthly",
  "tax_included": true,
  "packages": [
    {
      "id": "internet_giga",
      "category": "internet",
      "name": "Internet Giga",
      "speed_down_mbps": 300,
      "speed_up_mbps": null,
      "monthly_price": 195000,
      "equipment": "Wi-Fi 6 modem",
      "features": ["Basic internet", "Standard WiFi coverage"],
      "target_segment": "budget_users"
    }
  ]
}
```

### Phase 2: Multi-Period Pricing (TBD)
Requires additional data collection:
- Contact FPT B2B sales for official multi-period discount structure
- Research competitor pricing for 3/6/12-month terms
- Determine if discounts apply per industry standard (~10-15% for 12-month)

### Phase 3: Regional Pricing
Need to implement location-based modifier:
- Northern region (Hanoi, Hai Phong)
- Central region (Da Nang, Hue)
- Southern region (Ho Chi Minh, Can Tho)
- Remote/rural areas (potential premium or service unavailability)

### Phase 4: Add-on Pricing
Once clarified:
- WiFi Access Point standalone cost
- Installation fee structure
- Equipment rental monthly charge
- Cable extension/setup costs

---

## Data Quality Notes

- **Confidence Level:** HIGH for monthly pricing
- **Confidence Level:** MEDIUM for feature completeness (TV package details unclear)
- **Confidence Level:** LOW for multi-period and regional pricing
- **Last Verified:** 2026-03-03
- **Data Source Reliability:** Official FPT website homepage

---

## System Integration Checklist

- [ ] Create service_category table (Internet, TV, Cloud, Telecom, Smart Devices)
- [ ] Create package table with pricing data
- [ ] Add regional pricing modifier system
- [ ] Implement multi-period pricing logic (pending data)
- [ ] Add equipment/addon pricing (pending data)
- [ ] Create quote calculation engine
- [ ] Set up discount rule engine
- [ ] Integrate with customer database for personalization
- [ ] Add promotional/seasonal pricing override capability
- [ ] Create admin panel for price updates
- [ ] Set up API for real-time pricing (if FPT provides)

---

**Report Status:** Ready for system implementation (with noted data gaps)
**Next Review Date:** When FPT B2B pricing list is obtained
