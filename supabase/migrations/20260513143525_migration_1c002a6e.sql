-- Actually, let's use an even simpler approach that avoids recursion entirely
-- Drop both policies first
DROP POLICY IF EXISTS "select_own_companies" ON companies;
DROP POLICY IF EXISTS "hq_select_all_companies" ON companies;

-- Policy 1: Basic access - users see their own companies
CREATE POLICY "view_own_companies_basic" ON companies
  FOR SELECT
  USING (owner_id = auth.uid());

-- Policy 2: For the HQ view all feature, we'll handle this at the application level
-- OR create a database function that caches the HQ status to avoid recursion
-- For now, let's just allow basic functionality