import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { companyService } from "@/services/companyService";
import { voucherService } from "@/services/voucherService";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { ArrowLeft, Download, TrendingUp, Building2, AlertCircle, Crown, BarChart3 } from "lucide-react";
import { SEO } from "@/components/SEO";

type Company = Tables<"companies">;
type Voucher = Tables<"vouchers">;

interface ChurchSummary {
  company: Company;
  totalVouchers: number;
  totalDebits: number;
  totalCredits: number;
  lastVoucherDate: string | null;
}

export default function ConsolidatedReports() {
  const router = useRouter();
  const [isHQ, setIsHQ] = useState(false);
  const [churches, setChurches] = useState<Company[]>([]);
  const [summaries, setSummaries] = useState<ChurchSummary[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkHQAccess();
  }, []);

  async function checkHQAccess() {
    try {
      const companyId = sessionStorage.getItem("selectedCompanyId");
      if (!companyId) {
        router.push("/");
        return;
      }

      const company = await companyService.getCompanyById(companyId);
      
      if (!company.is_headquarters) {
        setError("Access denied. This page is only available to HQ Lamka.");
        setLoading(false);
        return;
      }

      setIsHQ(true);
      await loadAllChurches();
    } catch (err: any) {
      console.error("Error checking HQ access:", err);
      setError("Failed to verify HQ access.");
      setLoading(false);
    }
  }

  async function loadAllChurches() {
    try {
      const allCompanies = await companyService.getCompanies();
      setChurches(allCompanies);
      
      // Load summaries for each church
      const summaryPromises = allCompanies.map(async (company) => {
        const { data: vouchers } = await supabase
          .from("vouchers")
          .select("*")
          .eq("company_id", company.id);

        const totalDebits = vouchers?.reduce((sum, v) => sum + (Number(v.total_amount) || 0), 0) || 0;
        const totalCredits = totalDebits; // In double-entry, they're always equal
        const lastVoucher = vouchers?.[0];

        return {
          company,
          totalVouchers: vouchers?.length || 0,
          totalDebits,
          totalCredits,
          lastVoucherDate: lastVoucher?.voucher_date || null,
        };
      });

      const summaryData = await Promise.all(summaryPromises);
      setSummaries(summaryData);
    } catch (err: any) {
      console.error("Error loading churches:", err);
      setError("Failed to load church data.");
    } finally {
      setLoading(false);
    }
  }

  const totalChurches = churches.length;
  const totalVouchers = summaries.reduce((sum, s) => sum + s.totalVouchers, 0);
  const totalAmount = summaries.reduce((sum, s) => sum + s.totalDebits, 0);
  const hqChurch = churches.find(c => c.is_headquarters);
  const branchChurches = churches.filter(c => !c.is_headquarters);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8">
          <p className="text-center text-muted-foreground">Loading consolidated data...</p>
        </Card>
      </div>
    );
  }

  if (!isHQ) {
    return (
      <>
        <SEO title="Access Denied - Tally Prime" />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="p-8 max-w-md">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || "This page is only accessible to HQ Lamka."}
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push("/")} className="w-full mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gateway
            </Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="HQ Consolidated Reports - Tally Prime" />
      
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
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-400" />
              <h1 className="text-lg font-bold">HQ Consolidated Reports</h1>
            </div>
          </div>
          <Button size="sm" variant="secondary" className="gap-2">
            <Download className="h-4 w-4" />
            Export (Ctrl+E)
          </Button>
        </div>

        {/* Main Content */}
        <div className="container py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Churches</p>
                    <p className="text-2xl font-bold">{totalChurches}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Vouchers</p>
                    <p className="text-2xl font-bold">{totalVouchers}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <Crown className="h-8 w-8 text-amber-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Branches</p>
                    <p className="text-2xl font-bold">{branchChurches.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            <Tabs defaultValue="summary">
              <TabsList>
                <TabsTrigger value="summary">Church Summary</TabsTrigger>
                <TabsTrigger value="comparison">Side-by-Side Comparison</TabsTrigger>
                <TabsTrigger value="consolidated">Consolidated Statements</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-6">
                <Card>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-4">All Churches Overview</h3>
                    <div className="border rounded">
                      <table className="tally-table">
                        <thead>
                          <tr>
                            <th>Church Name</th>
                            <th>Church Code</th>
                            <th>Location</th>
                            <th>Total Vouchers</th>
                            <th>Total Amount</th>
                            <th>Last Transaction</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summaries.map(summary => (
                            <tr key={summary.company.id}>
                              <td>
                                <div className="flex items-center gap-2">
                                  {summary.company.is_headquarters && (
                                    <Crown className="h-4 w-4 text-amber-500" />
                                  )}
                                  {summary.company.name}
                                </div>
                              </td>
                              <td className="font-mono text-sm">
                                {summary.company.church_code || "-"}
                              </td>
                              <td className="text-sm">{summary.company.city || summary.company.address || "-"}</td>
                              <td className="text-right">{summary.totalVouchers}</td>
                              <td className="text-right">₹{summary.totalDebits.toFixed(2)}</td>
                              <td className="text-sm">
                                {summary.lastVoucherDate 
                                  ? new Date(summary.lastVoucherDate).toLocaleDateString()
                                  : "No transactions"}
                              </td>
                              <td>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  summary.company.is_active 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {summary.company.is_active ? "Active" : "Inactive"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-muted/50 font-bold">
                            <td colSpan={3}>TOTAL</td>
                            <td className="text-right">{totalVouchers}</td>
                            <td className="text-right">₹{totalAmount.toFixed(2)}</td>
                            <td colSpan={2}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="comparison" className="mt-6">
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4">Church-by-Church Comparison</h3>
                  <Alert className="mb-4 border-blue-200 bg-blue-50 text-blue-900">
                    <AlertDescription>
                      Compare financial metrics across all churches. Click on a church to view detailed reports.
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {summaries.map(summary => (
                      <Card key={summary.company.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {summary.company.is_headquarters && (
                                <Crown className="h-4 w-4 text-amber-500" />
                              )}
                              <h4 className="font-bold">{summary.company.name}</h4>
                            </div>
                            {summary.company.church_code && (
                              <p className="text-xs text-muted-foreground font-mono">
                                {summary.company.church_code}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Vouchers:</span>
                            <span className="font-mono">{summary.totalVouchers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-mono">₹{summary.totalDebits.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Activity:</span>
                            <span className="font-mono text-xs">
                              {summary.lastVoucherDate 
                                ? new Date(summary.lastVoucherDate).toLocaleDateString()
                                : "None"}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="consolidated" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Consolidated Financial Statement</h3>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Export for Auditor
                    </Button>
                  </div>
                  
                  <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-900">
                    <AlertDescription>
                      This consolidated statement combines all churches' financial data. 
                      Perfect for presenting to auditors or generating annual reports.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Summary by Church</h4>
                      <div className="border rounded">
                        <table className="tally-table">
                          <thead>
                            <tr>
                              <th>Church</th>
                              <th>Total Debits</th>
                              <th>Total Credits</th>
                              <th>Net Position</th>
                            </tr>
                          </thead>
                          <tbody>
                            {summaries.map(summary => (
                              <tr key={summary.company.id}>
                                <td>{summary.company.name}</td>
                                <td className="text-right font-mono">
                                  ₹{summary.totalDebits.toFixed(2)}
                                </td>
                                <td className="text-right font-mono">
                                  ₹{summary.totalCredits.toFixed(2)}
                                </td>
                                <td className="text-right font-mono">
                                  ₹{(summary.totalDebits - summary.totalCredits).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-primary/10 font-bold">
                              <td>CONSOLIDATED TOTAL</td>
                              <td className="text-right font-mono">₹{totalAmount.toFixed(2)}</td>
                              <td className="text-right font-mono">₹{totalAmount.toFixed(2)}</td>
                              <td className="text-right font-mono">₹0.00</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> This consolidated report is generated in real-time from all church databases. 
                        Each church maintains complete isolation of their ledgers and transactions. 
                        Only HQ Lamka has visibility into consolidated data.
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}