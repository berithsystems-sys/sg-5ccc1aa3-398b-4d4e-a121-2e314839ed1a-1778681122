import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { companyService } from "@/services/companyService";
import type { Tables } from "@/integrations/supabase/types";
import { Plus, Building2 } from "lucide-react";

type Company = Tables<"companies">;
type FinancialYear = Tables<"financial_years">;

interface CompanySelectorProps {
  onCompanySelect: (companyId: string, yearId: string) => void;
}

export function CompanySelector({ onCompanySelect }: CompanySelectorProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [years, setYears] = useState<FinancialYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New company form
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [yearStart, setYearStart] = useState("2024-04-01");
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadFinancialYears(selectedCompany);
    }
  }, [selectedCompany]);

  async function loadCompanies() {
    try {
      const data = await companyService.getCompanies();
      setCompanies(data);
      if (data.length > 0) {
        setSelectedCompany(data[0].id);
      }
    } catch (err) {
      console.error("Error loading companies:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadFinancialYears(companyId: string) {
    try {
      const data = await companyService.getFinancialYears(companyId);
      setYears(data);
      const activeYear = data.find(y => !y.is_locked) || data[0];
      if (activeYear) {
        setSelectedYear(activeYear.id);
      }
    } catch (err) {
      console.error("Error loading years:", err);
    }
  }

  async function handleCreateCompany(e: React.FormEvent) {
    e.preventDefault();
    try {
      const company = await companyService.createCompany({
        name,
        address,
        gstin,
        pan,
        financial_year_start: yearStart,
        currency,
        city: "",
        state: "",
        pincode: "",
        decimal_places: 2,
        is_active: true
      });

      setIsCreateOpen(false);
      await loadCompanies();
      setSelectedCompany(company.id);
      
      // Reset form
      setName("");
      setAddress("");
      setGstin("");
      setPan("");
      setYearStart("2024-04-01");
      setCurrency("INR");
    } catch (err) {
      console.error("Error creating company:", err);
    }
  }

  function getYearEnd(start: string): string {
    const startDate = new Date(start);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    endDate.setDate(endDate.getDate() - 1);
    return endDate.toISOString().split("T")[0];
  }

  function handleProceed() {
    if (selectedCompany && selectedYear) {
      onCompanySelect(selectedCompany, selectedYear);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading companies...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Select Company</h1>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Company</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="ABC Pvt Ltd"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main Street, City"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input
                      id="gstin"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="22AAAAA0000A1Z5"
                      maxLength={15}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pan">PAN</Label>
                    <Input
                      id="pan"
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      placeholder="AAAAA0000A"
                      maxLength={10}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="yearStart">Financial Year Start *</Label>
                    <Input
                      id="yearStart"
                      type="date"
                      value={yearStart}
                      onChange={(e) => setYearStart(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currency">Currency *</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Company</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {companies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No companies found. Create your first company to get started.</p>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Company
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label htmlFor="company">Select Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger id="company" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {years.length > 0 && (
              <div>
                <Label htmlFor="year">Financial Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger id="year" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {new Date(year.year_start).toLocaleDateString()} - {new Date(year.year_end).toLocaleDateString()}
                        {year.is_locked && " (Locked)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              onClick={handleProceed} 
              disabled={!selectedCompany || !selectedYear}
              className="w-full"
            >
              Proceed to Gateway
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}