---
title: GST Reports (GSTR-1, GSTR-3B)
status: todo
priority: medium
type: feature
created_by: agent
created_at: 2026-05-14T09:52:00Z
position: 11
---

## Notes
Generate GST statutory reports required for filing: GSTR-1 (sales) and GSTR-3B (summary).

## Checklist
- [ ] Create /reports/gst page
- [ ] GSTR-1: B2B invoices, B2C sales, credit/debit notes
- [ ] GSTR-3B: Summary of supplies, ITC, tax liability
- [ ] Month/Quarter filter
- [ ] Calculate: CGST, SGST, IGST separately
- [ ] Group by GST rates (0%, 5%, 12%, 18%, 28%)
- [ ] Export to Excel format matching GST portal
- [ ] Validation: Check GSTIN format, amounts

## Acceptance
- GSTR-1 report generates with all invoice details
- GSTR-3B summary calculates correctly
- Export format matches GST portal requirements