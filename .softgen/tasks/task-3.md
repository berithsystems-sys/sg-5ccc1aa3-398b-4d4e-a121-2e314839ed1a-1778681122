---
title: Chart of Accounts - Groups & Ledgers
status: done
priority: high
type: feature
tags: [accounting, masters]
created_by: agent
created_at: 2026-05-13T11:45:51Z
position: 3
---

## Notes
Chart of Accounts foundation: Groups (categories) and Ledgers (individual accounts). Pre-seed standard accounting groups (Assets, Liabilities, Income, Expenses). Enable GST applicability tagging.

## Checklist
- [ ] Create account_groups table (name, parent_id for hierarchy, group_type: Assets/Liabilities/Income/Expenses)
- [ ] Create ledgers table (name, group_id, opening_balance, gst_applicable, gstin, state_code)
- [ ] Seed default groups (Capital, Current Assets, Fixed Assets, Sales, Purchase, Direct/Indirect Expenses)
- [ ] Group master form (create/edit groups with parent selection)
- [ ] Ledger master form (create/edit ledgers with group, GST details)
- [ ] Tree view display of chart of accounts

## Acceptance
- User can create groups and sub-groups
- User can create ledgers under groups
- Chart of accounts displays in hierarchical tree
- GST-enabled ledgers show GSTIN field