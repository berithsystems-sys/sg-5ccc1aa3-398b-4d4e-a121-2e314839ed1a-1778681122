import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type AccountGroup = Tables<"account_groups">;
export type Ledger = Tables<"ledgers">;

export const ledgerService = {
  async getAccountGroups(companyId: string) {
    const { data, error } = await supabase
      .from("account_groups")
      .select("*")
      .eq("company_id", companyId)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  async createAccountGroup(group: Omit<AccountGroup, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("account_groups")
      .insert(group)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getLedgers(companyId: string) {
    const { data, error } = await supabase
      .from("ledgers")
      .select(`
        *,
        account_groups!ledgers_group_id_fkey(id, name, group_type)
      `)
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  async getLedgerById(id: string) {
    const { data, error } = await supabase
      .from("ledgers")
      .select(`
        *,
        account_groups!ledgers_group_id_fkey(id, name, group_type)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createLedger(ledger: Omit<Ledger, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("ledgers")
      .insert(ledger)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLedger(id: string, updates: Partial<Ledger>) {
    const { data, error } = await supabase
      .from("ledgers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async seedDefaultGroups(companyId: string) {
    const defaultGroups = [
      { name: "Capital Account", group_type: "Liabilities", parent_id: null },
      { name: "Current Assets", group_type: "Assets", parent_id: null },
      { name: "Fixed Assets", group_type: "Assets", parent_id: null },
      { name: "Current Liabilities", group_type: "Liabilities", parent_id: null },
      { name: "Sales Accounts", group_type: "Income", parent_id: null },
      { name: "Purchase Accounts", group_type: "Expenses", parent_id: null },
      { name: "Direct Expenses", group_type: "Expenses", parent_id: null },
      { name: "Indirect Expenses", group_type: "Expenses", parent_id: null },
      { name: "Direct Incomes", group_type: "Income", parent_id: null },
      { name: "Indirect Incomes", group_type: "Income", parent_id: null },
      { name: "Bank Accounts", group_type: "Assets", parent_id: null },
      { name: "Cash-in-Hand", group_type: "Assets", parent_id: null },
      { name: "Sundry Debtors", group_type: "Assets", parent_id: null },
      { name: "Sundry Creditors", group_type: "Liabilities", parent_id: null },
    ];

    const groups = defaultGroups.map(g => ({
      ...g,
      company_id: companyId,
    }));

    const { error } = await supabase
      .from("account_groups")
      .insert(groups);

    if (error) throw error;
  },
};