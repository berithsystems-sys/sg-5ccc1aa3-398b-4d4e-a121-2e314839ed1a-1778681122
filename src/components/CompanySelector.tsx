import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { companyService } from "@/services/companyService";
import { Building2, Plus, Crown } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Company = Tables<"companies">;
type FinancialYear = Tables<"financial_years">;

export function CompanySelector() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [years, setYears] = useState<FinancialYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<FinancialYear | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    church_code: "",
    address: "",
    gstin: "",
    pan: "",
    financial_year_start: "",
    currency: "INR",
    is_headquarters: false,
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadYears(selectedCompany.id);
      sessionStorage.setItem("selectedCompanyId", selectedCompany.id);
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedYear) {
      sessionStorage.setItem("selectedYearId", selectedYear.id);
    }
  }, [selectedYear]);

  const loadCompanies = async () => {
    try {
      const data = await companyService.getCompanies();
      setCompanies(data);
      
      // Auto-select first company
      if (data.length > 0 && !selectedCompany) {
        setSelectedCompany(data[0]);
      }
    } catch (error: any) {
      console.error("Error loading companies:", error);
      alert("Failed to load companies: " + error.message);
    }
  };

  const loadYears = async (companyId: string) => {
    try {
      const data = await companyService.getFinancialYears(companyId);
      setYears(data);
      
      // Auto-select first year
      if (data.length > 0 && !selectedYear) {
        setSelectedYear(data[0]);
      }
    } catch (error: any) {
      console.error("Error loading years:", error);
      alert("Failed to load financial years: " + error.message);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.financial_year_start) {
      alert("Please fill in required fields: Church Name and Financial Year Start");
      return;
    }

    setLoading(true);
    try {
      const newCompany = await companyService.createCompany({
        name: formData.name,
        church_code: formData.church_code || null,
        address: formData.address || null,
        gstin: formData.gstin || null,
        pan: formData.pan || null,
        currency: formData.currency,
        is_headquarters: formData.is_headquarters,
      });

      // Create financial year for the company
      await companyService.createFinancialYear({
        company_id: newCompany.id,
        year_name: `FY ${new Date(formData.financial_year_start).getFullYear()}-${new Date(formData.financial_year_start).getFullYear() + 1}`,
        start_date: formData.financial_year_start,
        end_date: new Date(new Date(formData.financial_year_start).setFullYear(new Date(formData.financial_year_start).getFullYear() + 1)).toISOString().split('T')[0],
        is_active: true,
      });

      alert("Church created successfully!");
      setIsDialogOpen(false);
      
      // Reset form
      setFormData({
        name: "",
        church_code: "",
        address: "",
        gstin: "",
        pan: "",
        financial_year_start: "",
        currency: "INR",
        is_headquarters: false,
      });
      
      // Reload companies and select new one
      await loadCompanies();
      setSelectedCompany(newCompany);
    } catch (error: any) {
      console.error("Error creating company:", error);
      alert("Failed to create church: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Select Church / Company</h2>
            <Button onClick={() => setIsDialogOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Church
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Church / Company</Label>
              <Select
                value={selectedCompany?.id || ""}
                onValueChange={(value) => {
                  const company = companies.find(c => c.id === value);
                  setSelectedCompany(company || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select church..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex items-center gap-2">
                        {company.is_headquarters && <Crown className="w-4 h-4 text-amber-500" />}
                        <span>{company.name}</span>
                        {company.church_code && (
                          <span className="text-xs text-muted-foreground">({company.church_code})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Financial Year</Label>
              <Select
                value={selectedYear?.id || ""}
                onValueChange={(value) => {
                  const year = years.find(y => y.id === value);
                  setSelectedYear(year || null);
                }}
                disabled={!selectedCompany}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year..." />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.year_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCompany && (
            <div className="pt-4 border-t space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Church Code:</span>
                  <span className="ml-2 font-medium">{selectedCompany.church_code || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Currency:</span>
                  <span className="ml-2 font-medium">{selectedCompany.currency}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="ml-2">{selectedCompany.address || "N/A"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Church / Company</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Church / Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., EBC Lamka HQ"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="church_code">Church Code</Label>
                  <Input
                    id="church_code"
                    value={formData.church_code}
                    onChange={(e) => setFormData({ ...formData, church_code: e.target.value })}
                    placeholder="e.g., LBC-001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Complete address"
                />
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="is_hq"
                    checked={formData.is_headquarters}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_headquarters: checked === true })
                    }
                  />
                  <div className="flex-1">
                    <label htmlFor="is_hq" className="flex items-center gap-2 font-semibold cursor-pointer">
                      <Crown className="w-5 h-5 text-amber-600" />
                      This is HQ Lamka (Headquarters)
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      HQ can view all churches' reports and generate consolidated statements
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pan">PAN</Label>
                  <Input
                    id="pan"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                    placeholder="AAAAA0000A"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fy_start">Financial Year Start *</Label>
                  <Input
                    id="fy_start"
                    type="date"
                    value={formData.financial_year_start}
                    onChange={(e) => setFormData({ ...formData, financial_year_start: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}