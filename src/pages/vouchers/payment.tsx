import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ledgerService } from "@/services/ledgerService";
import { voucherService } from "@/services/voucherService";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { ArrowLeft, Plus, Trash2, Save, Calculator } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

type Ledger = Tables<"ledgers">;

interface VoucherLine {
  id: string;
  ledgerId: string;
  ledgerName: string;
  amount: number;
  type: "Dr" | "Cr";
}

export default function PaymentVoucher() {
  const router = useRouter();
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [voucherNumber, setVoucherNumber] = useState("");
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split("T")[0]);
  const [narration, setNarration] = useState("");
  const [lines, setLines] = useState<VoucherLine[]>([
    { id: "1", ledgerId: "", ledgerName: "", amount: 0, type: "Dr" },
    { id: "2", ledgerId: "", ledgerName: "", amount: 0, type: "Cr" },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useKeyboardShortcuts([
    { key: "F2", action: () => document.getElementById("voucherDate")?.focus() },
    { key: "s", ctrl: true, action: handleSave },
    { key: "Escape", action: () => router.push("/") },
  ]);

  async function loadData() {
    try {
      const companyId = sessionStorage.getItem("selectedCompanyId");
      if (!companyId) {
        router.push("/");
        return;
      }

      const [ledgersData, nextNumber] = await Promise.all([
        ledgerService.getLedgers(companyId),
        voucherService.getNextVoucherNumber(companyId, "Payment")
      ]);

      setLedgers(ledgersData);
      setVoucherNumber(nextNumber.toString());
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }

  function addLine() {
    const newId = (Math.max(...lines.map(l => parseInt(l.id))) + 1).toString();
    setLines([...lines, { 
      id: newId, 
      ledgerId: "", 
      ledgerName: "", 
      amount: 0, 
      type: "Dr" 
    }]);
  }

  function removeLine(id: string) {
    if (lines.length <= 2) return; // Must have at least 2 lines
    setLines(lines.filter(l => l.id !== id));
  }

  function updateLine(id: string, field: keyof VoucherLine, value: string | number) {
    setLines(lines.map(line => {
      if (line.id === id) {
        if (field === "ledgerId") {
          const ledger = ledgers.find(l => l.id === value);
          return { ...line, ledgerId: value as string, ledgerName: ledger?.name || "" };
        }
        return { ...line, [field]: value };
      }
      return line;
    }));
  }

  function calculateTotals() {
    const debit = lines.filter(l => l.type === "Dr").reduce((sum, l) => sum + l.amount, 0);
    const credit = lines.filter(l => l.type === "Cr").reduce((sum, l) => sum + l.amount, 0);
    return { debit, credit, difference: Math.abs(debit - credit) };
  }

  async function handleSave() {
    if (saving) return;

    const totals = calculateTotals();
    if (totals.difference > 0.01) {
      alert("Voucher is not balanced. Debit and Credit must be equal.");
      return;
    }

    if (lines.some(l => !l.ledgerId || l.amount <= 0)) {
      alert("All lines must have a ledger and amount greater than 0.");
      return;
    }

    setSaving(true);
    try {
      const companyId = sessionStorage.getItem("selectedCompanyId");
      const yearId = sessionStorage.getItem("selectedYearId");
      if (!companyId || !yearId) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await voucherService.createVoucher({
        company_id: companyId,
        financial_year_id: yearId,
        created_by: session.user.id,
        voucher_type: "Payment",
        voucher_number: voucherNumber,
        voucher_date: voucherDate,
        total_amount: totals.debit,
        narration,
      }, lines.map(l => ({
        ledger_id: l.ledgerId,
        amount: l.amount,
        type: l.type,
      })));

      alert("Payment voucher saved successfully!");
      router.push("/");
    } catch (err) {
      console.error("Error saving voucher:", err);
      alert("Failed to save voucher. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const totals = calculateTotals();
  const isBalanced = totals.difference < 0.01;

  return (
    <>
      <SEO title="Payment Voucher - Tally Prime" />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="tally-header px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push("/")}
              className="text-primary-foreground hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Gateway
            </Button>
            <h1 className="text-lg font-bold">Payment Voucher</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={!isBalanced || saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save (Ctrl+S)"}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-8">
          <div className="max-w-5xl mx-auto">
            <Card className="p-6">
              {/* Voucher Header */}
              <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b">
                <div>
                  <Label htmlFor="voucherNumber">Voucher No.</Label>
                  <Input
                    id="voucherNumber"
                    value={voucherNumber}
                    onChange={(e) => setVoucherNumber(e.target.value)}
                    className="font-mono"
                  />
                </div>
                
                <div>
                  <Label htmlFor="voucherDate">Date (F2)</Label>
                  <Input
                    id="voucherDate"
                    type="date"
                    value={voucherDate}
                    onChange={(e) => setVoucherDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Type</Label>
                  <div className="h-10 px-3 py-2 bg-muted rounded-sm font-semibold">
                    Payment
                  </div>
                </div>
              </div>

              {/* Voucher Lines */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-muted-foreground">
                  <div className="col-span-5">Ledger Account</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-3 text-right">Amount</div>
                  <div className="col-span-2"></div>
                </div>

                {lines.map((line, index) => (
                  <div key={line.id} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-5">
                      <Select 
                        value={line.ledgerId} 
                        onValueChange={(v) => updateLine(line.id, "ledgerId", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ledger..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ledgers.map(ledger => (
                            <SelectItem key={ledger.id} value={ledger.id}>
                              {ledger.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-2">
                      <Select 
                        value={line.type} 
                        onValueChange={(v) => updateLine(line.id, "type", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dr">Debit</SelectItem>
                          <SelectItem value="Cr">Credit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-3">
                      <Input
                        type="number"
                        step="0.01"
                        value={line.amount || ""}
                        onChange={(e) => updateLine(line.id, "amount", parseFloat(e.target.value) || 0)}
                        className="text-right font-mono"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="col-span-2 flex gap-2">
                      {index === lines.length - 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={addLine}
                          className="gap-1"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                      {lines.length > 2 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeLine(line.id)}
                          className="gap-1 text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Debit:</span>
                    <span className="font-mono font-semibold">{totals.debit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Credit:</span>
                    <span className="font-mono font-semibold">{totals.credit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Difference:</span>
                    <span className={`font-mono font-semibold ${isBalanced ? "text-green-600" : "text-destructive"}`}>
                      {totals.difference.toFixed(2)}
                    </span>
                  </div>
                </div>
                {!isBalanced && (
                  <p className="text-sm text-destructive mt-2 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Voucher is not balanced. Adjust amounts to make Debit = Credit.
                  </p>
                )}
              </div>

              {/* Narration */}
              <div>
                <Label htmlFor="narration">Narration</Label>
                <textarea
                  id="narration"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-sm resize-none"
                  placeholder="Enter transaction description..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
                <Button variant="outline" onClick={() => router.push("/")}>
                  Cancel (Esc)
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={!isBalanced || saving}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Voucher"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}