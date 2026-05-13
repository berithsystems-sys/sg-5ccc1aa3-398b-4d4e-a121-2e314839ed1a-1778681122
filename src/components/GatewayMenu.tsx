import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { companyService } from "@/services/companyService";
import { authService } from "@/services/authService";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { Tables } from "@/integrations/supabase/types";
import { 
  FileText, BookOpen, BarChart3, Settings, LogOut, 
  Building2, Calendar, Crown, TrendingUp
} from "lucide-react";
import { CompanySelector } from "./CompanySelector";

type Company = Tables<"companies">;
type FinancialYear = Tables<"financial_years">;

export function GatewayMenu() {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedYear, setSelectedYear] = useState<FinancialYear | null>(null);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isHQ, setIsHQ] = useState(false);

  useEffect(() => {
    loadCompanyData();
  }, []);

  useKeyboardShortcuts([
    { key: "F4", action: () => router.push("/vouchers/payment") },
    { key: "F5", action: () => router.push("/vouchers/receipt") },
    { key: "F6", action: () => router.push("/vouchers/contra") },
    { key: "F7", action: () => router.push("/vouchers/journal") },
    { key: "l", alt: true, action: () => router.push("/accounts/chart?tab=ledgers") },
    { key: "g", alt: true, action: () => router.push("/accounts/chart?tab=groups") },
    { key: "v", alt: true, action: () => router.push("/vouchers/payment") },
    { key: "c", alt: true, action: () => setIsCompanyOpen(true) },
    { key: "r", alt: true, action: () => isHQ && router.push("/reports/consolidated") },
  ], !!selectedCompany);

  async function loadCompanyData() {
    try {
      const companyId = sessionStorage.getItem("selectedCompanyId");
      const yearId = sessionStorage.getItem("selectedYearId");

      if (!companyId || !yearId) {
        setIsCompanyOpen(true);
        return;
      }

      const [company, year] = await Promise.all([
        companyService.getCompanyById(companyId),
        companyService.getFinancialYearById(yearId)
      ]);

      setSelectedCompany(company);
      setSelectedYear(year);
      setIsHQ(company.is_headquarters || false);
    } catch (err) {
      console.error("Error loading company data:", err);
      setIsCompanyOpen(true);
    }
  }

  async function handleLogout() {
    await authService.signOut();
    router.push("/auth/login");
  }

  function handleChangeCompany() {
    setIsCompanyOpen(true);
  }

  function handleCompanySelected(companyId: string, yearId: string) {
    setIsCompanyOpen(false);
    loadCompanyData();
  }

  if (isCompanyOpen || !selectedCompany || !selectedYear) {
    return <CompanySelector onCompanySelect={handleCompanySelected} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="tally-header px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              {isHQ && <Crown className="h-5 w-5 text-amber-400" />}
              <h1 className="text-xl font-bold">EBC HQ Accounting - Gateway of {selectedCompany.name}</h1>
            </div>
            <p className="text-sm text-primary-foreground/80 mt-1">
              {selectedCompany.church_code && `${selectedCompany.church_code} • `}
              Period: {new Date(selectedYear.year_start).toLocaleDateString()} - {new Date(selectedYear.year_end).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleChangeCompany}
              className="text-primary-foreground hover:bg-primary/90"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Change Church
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary/90"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Gateway Menu */}
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vouchers Section */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold">Vouchers</h2>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 text-left"
                  onClick={() => router.push("/vouchers/payment")}
                >
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">F4</kbd>
                    <div>
                      <div className="font-semibold">Payment</div>
                      <div className="text-xs text-muted-foreground">Cash/bank payments</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 text-left"
                  onClick={() => router.push("/vouchers/receipt")}
                >
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">F5</kbd>
                    <div>
                      <div className="font-semibold">Receipt</div>
                      <div className="text-xs text-muted-foreground">Cash/bank receipts</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 text-left"
                  onClick={() => router.push("/vouchers/contra")}
                >
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">F6</kbd>
                    <div>
                      <div className="font-semibold">Contra</div>
                      <div className="text-xs text-muted-foreground">Bank-to-bank transfers</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 text-left"
                  onClick={() => router.push("/vouchers/journal")}
                >
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">F7</kbd>
                    <div>
                      <div className="font-semibold">Journal</div>
                      <div className="text-xs text-muted-foreground">Adjustments & corrections</div>
                    </div>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Accounts Section */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-6 w-6 text-accent" />
                <h2 className="text-xl font-bold">Accounts</h2>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 text-left"
                  onClick={() => router.push("/accounts/chart")}
                >
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Alt+L</kbd>
                    <div>
                      <div className="font-semibold">Chart of Accounts</div>
                      <div className="text-xs text-muted-foreground">Groups & ledgers</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 text-left"
                  onClick={() => alert("Opening balances coming soon")}
                >
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Alt+O</kbd>
                    <div>
                      <div className="font-semibold">Opening Balances</div>
                      <div className="text-xs text-muted-foreground">Set starting balances</div>
                    </div>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Reports Section */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-bold">Reports</h2>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 text-left"
                  onClick={() => alert("Day Book coming soon")}
                >
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Alt+D</kbd>
                    <div>
                      <div className="font-semibold">Day Book</div>
                      <div className="text-xs text-muted-foreground">Daily transactions</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 text-left"
                  onClick={() => alert("Trial Balance coming soon")}
                >
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Alt+T</kbd>
                    <div>
                      <div className="font-semibold">Trial Balance</div>
                      <div className="text-xs text-muted-foreground">Balance verification</div>
                    </div>
                  </div>
                </Button>

                {isHQ && (
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4 text-left border-amber-200 bg-amber-50 hover:bg-amber-100"
                    onClick={() => router.push("/reports/consolidated")}
                  >
                    <div className="flex items-center gap-3">
                      <Crown className="h-4 w-4 text-amber-600" />
                      <kbd className="px-2 py-1 bg-amber-200 rounded text-xs font-mono">Alt+R</kbd>
                      <div>
                        <div className="font-semibold text-amber-900">HQ Consolidated</div>
                        <div className="text-xs text-amber-700">All churches report</div>
                      </div>
                    </div>
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Company Info Footer */}
          <Card className="mt-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Logged in to</p>
                <div className="flex items-center gap-2 mt-1">
                  {isHQ && <Crown className="h-5 w-5 text-amber-500" />}
                  <p className="font-bold text-lg">{selectedCompany.name}</p>
                  {selectedCompany.church_code && (
                    <span className="text-sm text-muted-foreground font-mono">
                      ({selectedCompany.church_code})
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Quick Actions</p>
                <div className="flex gap-2 mt-1">
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleChangeCompany}>
                    <Building2 className="h-4 w-4 mr-2" />
                    Switch Church
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}