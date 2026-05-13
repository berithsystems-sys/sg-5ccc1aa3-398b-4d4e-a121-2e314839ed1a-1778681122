import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { companyService, type Company } from "@/services/companyService";
import { Building2, FileText, Package, BarChart3, Settings, LogOut } from "lucide-react";
import { authService } from "@/services/authService";
import { useRouter } from "next/router";

export function GatewayMenu() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const data = await companyService.getCompanies();
      setCompanies(data);
      if (data.length > 0 && !selectedCompany) {
        setSelectedCompany(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load companies:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await authService.signOut();
    router.push("/auth/login");
  }

  const menuSections = [
    {
      title: "Accounts Info",
      icon: FileText,
      items: [
        { label: "Ledgers", key: "Alt+L", path: "/ledgers" },
        { label: "Groups", key: "Alt+G", path: "/groups" },
        { label: "Vouchers", key: "Alt+V", path: "/vouchers" },
      ],
    },
    {
      title: "Inventory Info",
      icon: Package,
      items: [
        { label: "Stock Items", key: "Alt+I", path: "/items" },
        { label: "Stock Groups", key: "Alt+S", path: "/stock-groups" },
        { label: "Units", key: "Alt+U", path: "/units" },
      ],
    },
    {
      title: "Display",
      icon: BarChart3,
      items: [
        { label: "Trial Balance", key: "F3", path: "/reports/trial-balance" },
        { label: "Balance Sheet", key: "Alt+B", path: "/reports/balance-sheet" },
        { label: "P&L Statement", key: "Alt+P", path: "/reports/pl" },
      ],
    },
  ];

  const voucherShortcuts = [
    { label: "Payment", key: "F4", type: "Payment" },
    { label: "Receipt", key: "F5", type: "Receipt" },
    { label: "Contra", key: "F6", type: "Contra" },
    { label: "Journal", key: "F7", type: "Journal" },
    { label: "Sales", key: "F8", type: "Sales" },
    { label: "Purchase", key: "F9", type: "Purchase" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="tally-header px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Building2 className="w-6 h-6" />
          <h1 className="text-xl font-bold">Tally Prime</h1>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-64 bg-white">
              <SelectValue placeholder="Select Company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:text-white">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menuSections.map((section) => (
            <Card key={section.title} className="tally-panel p-6">
              <div className="flex items-center gap-3 mb-4">
                <section.icon className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-lg">{section.title}</h2>
              </div>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.path)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-muted transition-colors flex items-center justify-between group"
                  >
                    <span>{item.label}</span>
                    <span className="text-xs font-mono text-muted-foreground group-hover:text-accent">
                      {item.key}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Voucher Entry Shortcuts */}
        <Card className="tally-panel p-6">
          <h2 className="font-semibold text-lg mb-4">Voucher Entry (Function Keys)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {voucherShortcuts.map((voucher) => (
              <Button
                key={voucher.type}
                variant="outline"
                className="flex flex-col h-auto py-4 hover:bg-accent hover:text-accent-foreground"
                onClick={() => router.push(`/vouchers/${voucher.type.toLowerCase()}`)}
              >
                <span className="font-mono text-xs text-muted-foreground mb-1">{voucher.key}</span>
                <span className="font-medium">{voucher.label}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Bottom Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button onClick={() => router.push("/company/create")} className="bg-accent hover:bg-accent/90">
            Create Company
          </Button>
          <Button variant="outline" onClick={() => router.push("/company/settings")}>
            <Settings className="w-4 h-4 mr-2" />
            Company Settings
          </Button>
        </div>
      </div>
    </div>
  );
}