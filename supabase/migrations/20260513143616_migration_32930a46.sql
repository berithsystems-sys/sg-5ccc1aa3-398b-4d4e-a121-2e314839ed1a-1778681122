-- Create a function to safely check if current user is HQ
-- SECURITY DEFINER allows it to bypass RLS when checking
CREATE OR REPLACE FUNCTION is_user_hq()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM companies 
    WHERE owner_id = auth.uid() 
    AND is_headquarters = true
    LIMIT 1
  );
$$;

-- Now add HQ policy using the function (no recursion because function bypasses RLS)
CREATE POLICY "hq_view_all_companies" ON companies
  FOR SELECT
  USING (is_user_hq() = true);