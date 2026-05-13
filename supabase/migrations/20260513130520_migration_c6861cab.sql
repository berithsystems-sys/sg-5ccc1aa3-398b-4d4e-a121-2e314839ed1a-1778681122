-- Add is_headquarters field to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_headquarters BOOLEAN DEFAULT false;

-- Add church_code field for easy identification
ALTER TABLE companies ADD COLUMN IF NOT EXISTS church_code TEXT;

-- Create index for faster HQ queries
CREATE INDEX IF NOT EXISTS idx_companies_is_headquarters ON companies(is_headquarters) WHERE is_headquarters = true;

-- Modify RLS policies to allow HQ to see all companies
DROP POLICY IF EXISTS "select_own_companies" ON companies;
CREATE POLICY "select_own_companies" ON companies
  FOR SELECT 
  USING (
    owner_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM companies hq 
      WHERE hq.owner_id = auth.uid() 
      AND hq.is_headquarters = true
    )
  );

-- Allow HQ to view all account groups
DROP POLICY IF EXISTS "select_company_groups" ON account_groups;
CREATE POLICY "select_company_groups" ON account_groups
  FOR SELECT 
  USING (
    company_id IN (
      SELECT id FROM companies 
      WHERE owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM companies hq 
      WHERE hq.owner_id = auth.uid() 
      AND hq.is_headquarters = true
    )
  );

-- Allow HQ to view all ledgers
DROP POLICY IF EXISTS "select_company_ledgers" ON ledgers;
CREATE POLICY "select_company_ledgers" ON ledgers
  FOR SELECT 
  USING (
    company_id IN (
      SELECT id FROM companies 
      WHERE owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM companies hq 
      WHERE hq.owner_id = auth.uid() 
      AND hq.is_headquarters = true
    )
  );

-- Allow HQ to view all vouchers
DROP POLICY IF EXISTS "select_company_vouchers" ON vouchers;
CREATE POLICY "select_company_vouchers" ON vouchers
  FOR SELECT 
  USING (
    company_id IN (
      SELECT id FROM companies 
      WHERE owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM companies hq 
      WHERE hq.owner_id = auth.uid() 
      AND hq.is_headquarters = true
    )
  );

-- Allow HQ to view all financial years
DROP POLICY IF EXISTS "select_company_years" ON financial_years;
CREATE POLICY "select_company_years" ON financial_years
  FOR SELECT 
  USING (
    company_id IN (
      SELECT id FROM companies 
      WHERE owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM companies hq 
      WHERE hq.owner_id = auth.uid() 
      AND hq.is_headquarters = true
    )
  );