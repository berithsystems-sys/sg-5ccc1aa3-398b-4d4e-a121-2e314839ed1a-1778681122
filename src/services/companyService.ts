import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Company = Tables<"companies">;
export type FinancialYear = Tables<"financial_years">;

export const companyService = {
  async getCompanies() {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  async getCompanyById(id: string) {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createCompany(company: Omit<Company, "id" | "owner_id" | "created_at" | "updated_at">) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("companies")
      .insert({
        ...company,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Create default financial year
    if (data) {
      await this.createFinancialYear({
        company_id: data.id,
        year_start: company.financial_year_start,
        year_end: new Date(new Date(company.financial_year_start).setFullYear(new Date(company.financial_year_start).getFullYear() + 1)),
        is_current: true,
        is_locked: false,
      });
    }

    return data;
  },

  async updateCompany(id: string, updates: Partial<Company>) {
    const { data, error } = await supabase
      .from("companies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCompany(id: string) {
    const { error } = await supabase
      .from("companies")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getFinancialYears(companyId: string) {
    const { data, error } = await supabase
      .from("financial_years")
      .select("*")
      .eq("company_id", companyId)
      .order("year_start", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getCurrentFinancialYear(companyId: string) {
    const { data, error } = await supabase
      .from("financial_years")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_current", true)
      .single();

    if (error) throw error;
    return data;
  },

  async createFinancialYear(year: Omit<FinancialYear, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("financial_years")
      .insert(year)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async setCurrentYear(companyId: string, yearId: string) {
    // Unset all current years for this company
    await supabase
      .from("financial_years")
      .update({ is_current: false })
      .eq("company_id", companyId);

    // Set the new current year
    const { data, error } = await supabase
      .from("financial_years")
      .update({ is_current: true })
      .eq("id", yearId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};