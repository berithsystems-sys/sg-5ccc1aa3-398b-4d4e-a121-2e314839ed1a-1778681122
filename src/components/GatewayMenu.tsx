import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authService } from "@/services/authService";
import { companyService } from "@/services/companyService";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { Tables } from "@/integrations/supabase/types";
import { 
  FileText, 
  Receipt, 
  CreditCard, 
  BookOpen, 
  Package, 
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown,
  Building2
} from "lucide-react";

type Company = Tables<"companies">;
type FinancialYear = Tables<"financial_years">;

interface GatewayMenuProps {
  companyId: string;
  yearId: string;
  onChangeCompany: () => void;
}

export function GatewayMenu({ companyId, yearId, onChangeCompany }: GatewayMenuProps) {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [year, setYear] = useState<FinancialYear | null>(null);

  useEffect(() => {
    loadCompanyData();
  }, [companyId, yearId]);

  async function loadCompanyData() {
    try {
      const [companyData, yearData] = await Promise.all([
        companyService.getCompanyById(companyId),
        companyService.getFinancialYearById(yearId)
      ]);
      setCompany(companyData);
      setYear(yearData);
    } catch (err) {
      console.error("Error loading company data:", err);
    }
  }

  useKeyboardShortcuts([
    { key: "F4", action: () => console.log("Payment voucher") },
    { key: "F5", action: () => console.log("Receipt voucher") },
    { key: "F6", action: () => console.log("Contra voucher") },
    { key: "F7", action: () => console.log("Journal voucher") },
    { key: "F8", action: () => console.log("Sales voucher") },
    { key: "F9", action: () => console.log("Purchase voucher") },
    { key: "L", alt: true, action: () => console.log("Create Ledger") },
    { key: "G", alt: true, action: () => console.log("Create Group") },
    { key: "V", alt: true, action: () => console.log("Voucher Entry") },
  ]);

  async function handleLogout() {
    await authService.signOut();
    router.push("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="tally-header px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Building2 className="h-6 w-6" />
          <div>
            <h1 className="text-lg font-bold">TALLY PRIME</h1>
            <p className="text-xs opacity-90">{company?.name || "Loading..."}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onChangeCompany}
            className="text-primary-foreground hover:bg-primary/90"
          >
            Change Company
          </Button>
          <span className="text-sm">
            FY: {year ? `${new Date(year.year_start).getFullYear()}-${new Date(year.year_end).getFullYear()}` : "..."}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Gateway Menu */}
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Gateway of Tally</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Accounts Section */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 text-primary border-b border-border pb-2">
                Accounts
              </h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-3">
                  <BookOpen className="h-4 w-4" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Chart of Accounts</div>
                    <div className="text-xs text-muted-foreground">Alt+L - Ledgers & Groups</div>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-3">
                  <FileText className="h-4 w-4" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Voucher Entry</div>
                    <div className="text-xs text-muted-foreground">Alt+V - Create Vouchers</div>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-3">
                  <CreditCard className="h-4 w-4" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Banking</div>
                    <div className="text-xs text-muted-foreground">Bank Reconciliation</div>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Inventory Section */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 text-primary border-b border-border pb-2">
                Inventory
              </h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-3">
                  <Package className="h-4 w-4" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Stock Items</div>
                    <div className="text-xs text-muted-foreground">Items & Units</div>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-3">
                  <Package className="h-4 w-4" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Stock Groups</div>
                    <div className="text-xs text-muted-foreground">Item Categories</div>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-3">
                  <Package className="h-4 w-4" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Godowns</div>
                    <div className="text-xs text-muted-foreground">Warehouse Management</div>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Reports Section */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 text-primary border-b border-border pb-2">
                Reports
              </h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-3">
                  <TrendingUp className="h-4 w-4" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Financial Statements</div>
                    <div className="text-xs text-muted-foreground">P&L, Balance Sheet</div>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-3">
                  <Receipt className="h-4 w-4" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Day Book</div>
                    <div className="text-xs text-muted-foreground">All Vouchers</div>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-3">
                  <FileText className="h-4 w-4" />
                  <div className="text-left flex-1">
                    <div className="font-medium">GST Reports</div>
                    <div className="text-xs text-muted-foreground">GSTR-1, GSTR-3B</div>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Vouchers Quick Entry */}
            <Card className="p-6 md:col-span-2">
              <h3 className="font-bold text-lg mb-4 text-primary border-b border-border pb-2">
                Quick Voucher Entry
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-center">
                    <div className="font-bold text-accent">F4</div>
                    <div className="text-sm">Payment</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-center">
                    <div className="font-bold text-accent">F5</div>
                    <div className="text-sm">Receipt</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-center">
                    <div className="font-bold text-accent">F6</div>
                    <div className="text-sm">Contra</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-center">
                    <div className="font-bold text-accent">F7</div>
                    <div className="text-sm">Journal</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-center">
                    <div className="font-bold text-accent">F8</div>
                    <div className="text-sm">Sales</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-center">
                    <div className="font-bold text-accent">F9</div>
                    <div className="text-sm">Purchase</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-center">
                    <div className="font-bold text-accent">F10</div>
                    <div className="text-sm">Credit Note</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-center">
                    <div className="font-bold text-accent">F11</div>
                    <div className="text-sm">Debit Note</div>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Settings */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 text-primary border-b border-border pb-2">
                Company
              </h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-3">
                  <Settings className="h-4 w-4" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Company Settings</div>
                    <div className="text-xs text-muted-foreground">Details & Configuration</div>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-3">
                  <Building2 className="h-4 w-4" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Financial Year</div>
                    <div className="text-xs text-muted-foreground">Year Management</div>
                  </div>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}