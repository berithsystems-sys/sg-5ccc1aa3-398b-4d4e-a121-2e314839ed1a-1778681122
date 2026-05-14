---
title: Bank Reconciliation
status: todo
priority: medium
type: feature
created_by: agent
created_at: 2026-05-14T09:52:00Z
position: 12
---

## Notes
Bank reconciliation tool to match vouchers with bank statements and identify unreconciled items.

## Checklist
- [ ] Create /banking/reconciliation page
- [ ] Select bank ledger and date range
- [ ] Upload bank statement CSV/Excel
- [ ] Auto-match transactions by date, amount, reference
- [ ] Manual match interface: drag voucher to statement line
- [ ] Show: Matched, Unmatched, Bank-only, Book-only
- [ ] Calculate: Book balance, Bank balance, Difference
- [ ] Mark vouchers as "Reconciled"
- [ ] Export reconciliation report

## Acceptance
- User can upload bank statement and auto-match transactions
- Unmatched items clearly identified
- Reconciliation report shows all differences