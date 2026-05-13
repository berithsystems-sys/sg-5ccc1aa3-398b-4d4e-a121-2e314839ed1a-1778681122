-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  gstin TEXT,
  pan TEXT,
  financial_year_start DATE NOT NULL DEFAULT '2024-04-01',
  currency TEXT DEFAULT 'INR',
  decimal_places INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Years table
CREATE TABLE financial_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  year_start DATE NOT NULL,
  year_end DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles enum
CREATE TYPE user_role AS ENUM ('Admin', 'Accountant', 'Data Entry', 'Viewer');

-- User Company Access table (multi-company permission mapping)
CREATE TABLE user_company_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role user_role DEFAULT 'Viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Account Groups table (hierarchical chart of accounts)
CREATE TABLE account_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES account_groups(id) ON DELETE CASCADE,
  group_type TEXT NOT NULL CHECK (group_type IN ('Assets', 'Liabilities', 'Income', 'Expenses')),
  affects_gross_profit BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- Ledgers table (individual accounts)
CREATE TABLE ledgers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES account_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  opening_balance DECIMAL(15,2) DEFAULT 0,
  balance_type TEXT DEFAULT 'Dr' CHECK (balance_type IN ('Dr', 'Cr')),
  gst_applicable BOOLEAN DEFAULT false,
  gstin TEXT,
  state_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- Voucher Types enum
CREATE TYPE voucher_type AS ENUM ('Payment', 'Receipt', 'Contra', 'Journal', 'Sales', 'Purchase', 'Credit Note', 'Debit Note');

-- Vouchers table
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  financial_year_id UUID NOT NULL REFERENCES financial_years(id) ON DELETE CASCADE,
  voucher_type voucher_type NOT NULL,
  voucher_number TEXT NOT NULL,
  voucher_date DATE NOT NULL DEFAULT CURRENT_DATE,
  narration TEXT,
  total_amount DECIMAL(15,2) DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, voucher_type, voucher_number)
);

-- Voucher Items (double-entry lines)
CREATE TABLE voucher_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  ledger_id UUID NOT NULL REFERENCES ledgers(id) ON DELETE CASCADE,
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies - Multi-tenancy through company ownership
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_company_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_items ENABLE ROW LEVEL SECURITY;

-- Companies: Users see only their companies
CREATE POLICY "select_own_companies" ON companies FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "insert_own_companies" ON companies FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "update_own_companies" ON companies FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "delete_own_companies" ON companies FOR DELETE USING (owner_id = auth.uid());

-- Financial Years: Users see years for their companies
CREATE POLICY "select_company_years" ON financial_years FOR SELECT 
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "insert_company_years" ON financial_years FOR INSERT 
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "update_company_years" ON financial_years FOR UPDATE 
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "delete_company_years" ON financial_years FOR DELETE 
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- User Company Access
CREATE POLICY "select_own_access" ON user_company_access FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "manage_own_access" ON user_company_access FOR ALL 
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Account Groups: Scoped to user's companies
CREATE POLICY "select_company_groups" ON account_groups FOR SELECT 
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "manage_company_groups" ON account_groups FOR ALL 
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Ledgers: Scoped to user's companies
CREATE POLICY "select_company_ledgers" ON ledgers FOR SELECT 
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "manage_company_ledgers" ON ledgers FOR ALL 
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Vouchers: Scoped to user's companies
CREATE POLICY "select_company_vouchers" ON vouchers FOR SELECT 
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "manage_company_vouchers" ON vouchers FOR ALL 
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Voucher Items: Through voucher's company
CREATE POLICY "select_voucher_items" ON voucher_items FOR SELECT 
  USING (voucher_id IN (
    SELECT id FROM vouchers WHERE company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  ));
CREATE POLICY "manage_voucher_items" ON voucher_items FOR ALL 
  USING (voucher_id IN (
    SELECT id FROM vouchers WHERE company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  ));

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();