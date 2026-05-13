import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authService } from "@/services/authService";
import { GatewayMenu } from "@/components/GatewayMenu";
import { CompanySelector } from "@/components/CompanySelector";
import { SEO } from "@/components/SEO";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const session = await authService.getCurrentSession();
      if (session) {
        setIsAuthenticated(true);
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }

  function handleCompanySelect(companyId: string, yearId: string) {
    setSelectedCompanyId(companyId);
    setSelectedYearId(yearId);
  }

  function handleChangeCompany() {
    setSelectedCompanyId(null);
    setSelectedYearId(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!selectedCompanyId || !selectedYearId) {
    return (
      <>
        <SEO 
          title="Select Company - Tally Prime"
          description="Select or create a company to continue"
        />
        <CompanySelector onCompanySelect={handleCompanySelect} />
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Gateway - Tally Prime"
        description="Accounting & Inventory ERP System"
      />
      <GatewayMenu 
        companyId={selectedCompanyId} 
        yearId={selectedYearId}
        onChangeCompany={handleChangeCompany}
      />
    </>
  );
}