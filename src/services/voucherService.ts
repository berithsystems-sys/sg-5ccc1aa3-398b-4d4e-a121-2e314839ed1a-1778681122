import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Voucher = Tables<"vouchers">;
export type VoucherItem = Tables<"voucher_items">;

export interface VoucherWithItems extends Voucher {
  voucher_items: (VoucherItem & {
    ledgers: {
      id: string;
      name: string;
    };
  })[];
}

export const voucherService = {
  async getVouchers(companyId: string, financialYearId: string) {
    const { data, error } = await supabase
      .from("vouchers")
      .select(`
        *,
        voucher_items(
          *,
          ledgers!voucher_items_ledger_id_fkey(id, name)
        )
      `)
      .eq("company_id", companyId)
      .eq("financial_year_id", financialYearId)
      .order("voucher_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as VoucherWithItems[];
  },

  async getVoucherById(id: string) {
    const { data, error } = await supabase
      .from("vouchers")
      .select(`
        *,
        voucher_items(
          *,
          ledgers!voucher_items_ledger_id_fkey(id, name)
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as VoucherWithItems;
  },

  async createVoucher(
    voucher: Omit<Voucher, "id" | "created_at">,
    items: Omit<VoucherItem, "id" | "voucher_id" | "created_at">[]
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Validate double-entry balance
    const totalDebits = items.reduce((sum, item) => sum + (item.debit_amount || 0), 0);
    const totalCredits = items.reduce((sum, item) => sum + (item.credit_amount || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error("Voucher is not balanced. Debits and Credits must be equal.");
    }

    // Create voucher
    const { data: voucherData, error: voucherError } = await supabase
      .from("vouchers")
      .insert({
        ...voucher,
        created_by: user.id,
        total_amount: totalDebits,
      })
      .select()
      .single();

    if (voucherError) throw voucherError;

    // Create voucher items
    const itemsWithVoucherId = items.map(item => ({
      ...item,
      voucher_id: voucherData.id,
    }));

    const { error: itemsError } = await supabase
      .from("voucher_items")
      .insert(itemsWithVoucherId);

    if (itemsError) throw itemsError;

    return voucherData;
  },

  async getNextVoucherNumber(companyId: string, voucherType: Voucher["voucher_type"]) {
    const { data, error } = await supabase
      .from("vouchers")
      .select("voucher_number")
      .eq("company_id", companyId)
      .eq("voucher_type", voucherType)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      const lastNumber = parseInt(data[0].voucher_number.replace(/\D/g, "")) || 0;
      return `${voucherType.substring(0, 3).toUpperCase()}${(lastNumber + 1).toString().padStart(4, "0")}`;
    }

    return `${voucherType.substring(0, 3).toUpperCase()}0001`;
  },

  async deleteVoucher(id: string) {
    const { error } = await supabase
      .from("vouchers")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};