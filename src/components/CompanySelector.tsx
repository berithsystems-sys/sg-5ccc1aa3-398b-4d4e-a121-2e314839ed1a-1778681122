import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { companyService } from "@/services/companyService";
import type { Tables } from "@/integrations/supabase/types";
import { Building2, Calendar, Plus, CheckCircle2, AlertCircle, Crown } from "lucide-react";

type Company = Tables<"companies">;
type FinancialYear = Tables<"financial_years">;

interface CompanySelectorProps {
  onCompanySelect: (companyId: string, yearId: string) => void;
}

export function CompanySelector({ onCompanySelect }: CompanySelectorProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [years, setYears] = useState<FinancialYear[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form state
  const [name, setName] = useState("");
  const [churchCode, setChurchCode] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [yearStart, setYearStart] = useState("2024-04-01");
  const [currency, setCurrency] = useState("INR");
  const [isHeadquarters, setIsHeadquarters] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadYears(selectedCompany);
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
      setError("Failed to load companies. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }

  async function loadYears(companyId: string) {
    try {
      const data = await companyService.getFinancialYears(companyId);
      setYears(data);
      const currentYear = data.find(y => y.is_current);
      if (currentYear) {
        setSelectedYear(currentYear.id);
      } else if (data.length > 0) {
        setSelectedYear(data[0].id);
      }
    } catch (err) {
      console.error("Error loading years:", err);
    }
  }

  async function handleCreateCompany(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      if (!name.trim()) {
        setError("Church/Company name is required");
        return;
      }

      const company = await companyService.createCompany({
        name,
        church_code: churchCode || null,
        address,
        gstin,
        pan,
        financial_year_start: yearStart,
        currency,
        is_headquarters: isHeadquarters,
        city: "",
        state: "",
        pincode: "",
        decimal_places: 2,
        is_active: true
      });

      setIsCreateOpen(false);
      setSuccess(`${isHeadquarters ? 'HQ Church' : 'Church'} "${name}" created successfully!`);
      setTimeout(() => setSuccess(""), 5000);
      await loadCompanies();
      setSelectedCompany(company.id);
      
      // Reset form
      setName("");
      setChurchCode("");
      setAddress("");
      setGstin("");
      setPan("");
      setYearStart("2024-04-01");
      setCurrency("INR");
      setIsHeadquarters(false);
    } catch (err: any) {
      console.error("Error creating company:", err);
      setError(`Failed to create church/company: ${err.message || "Unknown error"}`);
    }
  }

  function handleProceed() {
    if (selectedCompany && selectedYear) {
      sessionStorage.setItem("selectedCompanyId", selectedCompany);
      sessionStorage.setItem("selectedYearId", selectedYear);
      onCompanySelect(selectedCompany, selectedYear);
    }
  }

  const selectedCompanyData = companies.find(c => c.id === selectedCompany);
  const selectedYearData = years.find(y => y.id === selectedYear);
  const isHQ = selectedCompanyData?.is_headquarters;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-center text-muted-foreground">Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-8 max-w-2xl w-full">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Select Church / Company</h2>
            <p className="text-sm text-muted-foreground">Choose your church/company and financial year to begin</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50 text-green-900">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {companies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No churches/companies found. Create your first one.</p>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Church/Company
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label htmlFor="company" className="text-base font-semibold mb-2 block">
                Church / Company
              </Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger id="company" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex items-center gap-2">
                        {company.is_headquarters && <Crown className="h-4 w-4 text-amber-500" />}
                        <span>{company.name}</span>
                        {company.church_code && (
                          <span className="text-xs text-muted-foreground">({company.church_code})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isHQ && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  HQ Lamka - Can view all churches
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="year" className="text-base font-semibold mb-2 block">
                Financial Year
              </Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year.id} value={year.id}>
                      {new Date(year.year_start).toLocaleDateString()} - {new Date(year.year_end).toLocaleDateString()}
                      {year.is_current && " (Current)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={() => setIsCreateOpen(true)} 
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Church
              </Button>
              
              <Button 
                onClick={handleProceed}
                disabled={!selectedCompany || !selectedYear}
                className="flex-1"
              >
                Proceed to Gateway
              </Button>
            </div>
          </div>
        )}

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Church / Company</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Church / Company Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Lamka Baptist Church"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="churchCode">Church Code</Label>
                  <Input
                    id="churchCode"
                    value={churchCode}
                    onChange={(e) => setChurchCode(e.target.value.toUpperCase())}
                    placeholder="e.g., LBC-001"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Complete address"
                />
              </div>

              <div className="border rounded-lg p-4 bg-amber-50">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="isHeadquarters"
                    checked={isHeadquarters}
                    onChange={(e) => setIsHeadquarters(e.target.checked)}
                    className="rounded border-input"
                  />
                  <Label htmlFor="isHeadquarters" className="cursor-pointer flex items-center gap-2 font-semibold">
                    <Crown className="h-4 w-4 text-amber-600" />
                    This is HQ Lamka (Headquarters)
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  HQ can view all churches' reports and generate consolidated statements
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yearStart">Financial Year Start</Label>
                  <Input
                    id="yearStart"
                    type="date"
                    value={yearStart}
                    onChange={(e) => setYearStart(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
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
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}