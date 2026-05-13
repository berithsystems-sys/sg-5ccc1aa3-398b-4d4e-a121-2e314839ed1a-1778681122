---
title: Database Schema & Core Authentication
status: in_progress
priority: urgent
type: feature
tags: [database, auth, foundation]
created_by: agent
created_at: 2026-05-13T11:45:51Z
position: 1
---

## Notes
Foundation database tables for multi-company accounting system with role-based access control. Includes companies, financial years, users, and authentication setup.

## Checklist
- [ ] Create companies table (name, address, GSTIN, PAN, financial_year_start, currency)
- [ ] Create financial_years table (company_id, year_start, year_end, is_locked)
- [ ] Create user_roles table (role definitions: Admin, Accountant, Data Entry, Viewer)
- [ ] Create user_company_access table (user-to-company mapping with role)
- [ ] Set up RLS policies for multi-tenancy (users see only their companies)
- [ ] Create profiles auto-trigger for new users
- [ ] Enable email/password authentication in authService

## Acceptance
- User can register and login with email/password
- User can create multiple companies
- Company data is isolated (user A cannot see user B's companies)