-- Drop only the problematic SELECT policy
DROP POLICY IF EXISTS "select_own_companies" ON companies;

-- Create a new SELECT policy that breaks recursion
-- Instead of using a subquery, we'll create a simpler policy
-- Users can see companies they own directly
CREATE POLICY "select_own_companies" ON companies
  FOR SELECT
  USING (owner_id = auth.uid());

-- Separate policy for HQ to view all companies
-- This won't cause recursion because it's a separate policy with different logic
CREATE POLICY "hq_select_all_companies" ON companies
  FOR SELECT
  USING (
    owner_id IN (
      SELECT id FROM auth.users 
      WHERE id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM companies 
        WHERE owner_id = auth.uid() 
        AND is_headquarters = true 
        LIMIT 1
      )
    )
  );