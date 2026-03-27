---
status: pending
---

# Add PLHD & DNTT Templates

## Context
Add 2 new document templates based on FPT sample PDFs. Pixel-perfect layout required.
- **PLHD** (Phu Luc Hop Dong) — contract appendix with dynamic fee table
- **DNTT** (De Nghi Thanh Toan) — payment request letter, no item table
- 3 existing templates (quotation, delivery-order, warehouse-export) untouched

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | Extend template registry types | pending |
| 2 | Update detail pane for conditional rendering | pending |
| 3 | Create PLHD PDF template (pixel-perfect) | pending |
| 4 | Create DNTT PDF template (pixel-perfect) | pending |
| 5 | Register both templates | pending |
| 6 | Test & verify | pending |

## Key Decisions
- Option A: extend current system (formFields[], showProductSelector flag)
- Customer selector reused (Bên A = customer)
- Doc number: auto (PLHD-2026-001, DNTT-2026-001)
- PLHD items[] = {label, amount} dynamic rows
- DNTT has no items[]
- Data stored in templateFields for template-specific fields
