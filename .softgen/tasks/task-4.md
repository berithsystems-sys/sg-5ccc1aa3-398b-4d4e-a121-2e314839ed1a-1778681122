---
title: Voucher Entry System - Core Types
status: todo
priority: high
type: feature
tags: [vouchers, accounting, data-entry]
created_by: agent
created_at: 2026-05-13T11:45:51Z
position: 4
---

## Notes
Core voucher entry screens for all transaction types. Double-entry validation, date picker (F2), ledger search (F12), narration field. Focus on keyboard navigation and quick data entry.

## Checklist
- [ ] Create vouchers table (type, number, date, narration, total_amount, company_id, financial_year_id)
- [ ] Create voucher_items table (voucher_id, ledger_id, debit_amount, credit_amount)
- [ ] Payment voucher form (F4) - cash/bank payments
- [ ] Receipt voucher form (F5) - cash/bank receipts
- [ ] Contra voucher form (F6) - bank-to-bank transfers
- [ ] Journal voucher form (F7) - adjustments
- [ ] Double-entry validation (total debits = total credits)
- [ ] F2 date picker, F12 ledger lookup modal
- [ ] Auto-numbering with series prefix

## Acceptance
- User can enter Payment voucher with multiple ledger rows
- User presses F2 to change date
- Debit/Credit columns auto-balance
- Voucher saves only when balanced