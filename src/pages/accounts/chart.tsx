import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ledgerService } from "@/services/ledgerService";
import type { Tables } from "@/integrations/supabase/types";
import { ChevronRight, Plus, BookOpen, FolderOpen, Building2, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { SEO } from "@/components/SEO";

type AccountGroup = Tables<"account_groups">;
type Ledger = Tables<"ledgers">;

export default function ChartOfAccounts() {
  const router = useRouter();
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreateLedgerOpen, setIsCreateLedgerOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Group form
  const [groupName, setGroupName] = useState("");
  const [parentGroup, setParentGroup] = useState<string>("");
  const [groupType, setGroupType] = useState<AccountGroup["group_type"]>("Assets");
  
  // Ledger form
  const [ledgerName, setLedgerName] = useState("");
  const [ledgerGroup, setLedgerGroup] = useState<string>("");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [balanceType, setBalanceType] = useState<"Dr" | "Cr">("Dr");
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstin, setGstin] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setError("");
      const companyId = sessionStorage.getItem("selectedCompanyId");
      if (!companyId) {
        router.push("/");
        return;
      }

      const [groupsData, ledgersData] = await Promise.all([
        ledgerService.getAccountGroups(companyId),
        ledgerService.getLedgers(companyId)
      ]);

      setGroups(groupsData);
      setLedgers(ledgersData);
      
      // If no groups exist, seed default groups
      if (groupsData.length === 0) {
        await ledgerService.seedDefaultGroups(companyId);
        const newGroups = await ledgerService.getAccountGroups(companyId);
        setGroups(newGroups);
        setSuccess("Default account groups have been created for you!");
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (err: any) {
      console.error("Error loading chart of accounts:", err);
      setError(`Failed to load accounts: ${err.message || "Unknown error"}`);
    }
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      
      const companyId = sessionStorage.getItem("selectedCompanyId");
      if (!companyId) {
        setError("No company selected. Please select a company first.");
        return;
      }

      await ledgerService.createAccountGroup({
        company_id: companyId,
        name: groupName,
        parent_id: parentGroup || null,
        group_type: groupType,
        affects_gross_profit: false,
      });

      setIsCreateGroupOpen(false);
      setGroupName("");
      setParentGroup("");
      setGroupType("Assets");
      setSuccess(`Group "${groupName}" created successfully!`);
      setTimeout(() => setSuccess(""), 3000);
      await loadData();
    } catch (err: any) {
      console.error("Error creating group:", err);
      setError(`Failed to create group: ${err.message || "Unknown error"}`);
    }
  }

  async function handleCreateLedger(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      
      const companyId = sessionStorage.getItem("selectedCompanyId");
      if (!companyId) {
        setError("No company selected. Please select a company first.");
        return;
      }

      if (!ledgerGroup) {
        setError("Please select an account group for the ledger.");
        return;
      }

      await ledgerService.createLedger({
        company_id: companyId,
        name: ledgerName,
        group_id: ledgerGroup,
        opening_balance: parseFloat(openingBalance),
        balance_type: balanceType,
        gst_applicable: gstEnabled,
        gstin: gstEnabled ? gstin : null,
        is_active: true,
        state_code: null
      });

      setIsCreateLedgerOpen(false);
      setLedgerName("");
      setLedgerGroup("");
      setOpeningBalance("0");
      setBalanceType("Dr");
      setGstEnabled(false);
      setGstin("");
      setSuccess(`Ledger "${ledgerName}" created successfully!`);
      setTimeout(() => setSuccess(""), 3000);
      await loadData();
    } catch (err: any) {
      console.error("Error creating ledger:", err);
      setError(`Failed to create ledger: ${err.message || "Unknown error"}`);
    }
  }

  function getGroupLedgers(groupId: string) {
    return ledgers.filter(l => l.group_id === groupId);
  }

  function getChildGroups(parentId: string | null) {
    return groups.filter(g => g.parent_id === parentId);
  }

  function renderGroupTree(parentId: string | null = null, level = 0) {
    const childGroups = getChildGroups(parentId);
    
    return childGroups.map(group => {
      const groupLedgers = getGroupLedgers(group.id);
      const hasChildren = getChildGroups(group.id).length > 0 || groupLedgers.length > 0;

      return (
        <div key={group.id} style={{ marginLeft: `${level * 1.5}rem` }}>
          <div className="flex items-center py-2 hover:bg-muted/50 px-2 rounded cursor-pointer group">
            <FolderOpen className="h-4 w-4 text-primary mr-2" />
            <span className="font-medium flex-1">{group.name}</span>
            <span className="text-xs text-muted-foreground">{group.group_type}</span>
          </div>
          
          {groupLedgers.map(ledger => (
            <div 
              key={ledger.id} 
              className="flex items-center py-2 hover:bg-muted/50 px-2 rounded cursor-pointer"
              style={{ marginLeft: `${(level + 1) * 1.5}rem` }}
            >
              <BookOpen className="h-4 w-4 text-accent mr-2" />
              <span className="flex-1">{ledger.name}</span>
              <span className="text-xs font-mono text-muted-foreground">
                {ledger.opening_balance && Number(ledger.opening_balance) > 0 
                  ? `${Number(ledger.opening_balance).toFixed(2)} ${ledger.balance_type}` 
                  : "-"}
              </span>
            </div>
          ))}

          {renderGroupTree(group.id, level + 1)}
        </div>
      );
    });
  }

  return (
    <>
      <SEO title="Chart of Accounts - Tally Prime" />
      
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
            <h1 className="text-lg font-bold">Chart of Accounts</h1>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Group (Alt+G)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Account Group</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div>
                    <Label htmlFor="groupName">Group Name *</Label>
                    <Input
                      id="groupName"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                      placeholder="e.g., Current Assets"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="parentGroup">Parent Group</Label>
                    <Select value={parentGroup} onValueChange={setParentGroup}>
                      <SelectTrigger id="parentGroup">
                        <SelectValue placeholder="Primary Group (Root)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Primary Group (Root)</SelectItem>
                        {groups.map(g => (
                          <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="groupType">Nature *</Label>
                    <Select value={groupType} onValueChange={(v) => setGroupType(v as AccountGroup["group_type"])}>
                      <SelectTrigger id="groupType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Assets">Assets</SelectItem>
                        <SelectItem value="Liabilities">Liabilities</SelectItem>
                        <SelectItem value="Income">Income</SelectItem>
                        <SelectItem value="Expenses">Expenses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Group</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateLedgerOpen} onOpenChange={setIsCreateLedgerOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Ledger (Alt+L)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Ledger</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateLedger} className="space-y-4">
                  <div>
                    <Label htmlFor="ledgerName">Ledger Name *</Label>
                    <Input
                      id="ledgerName"
                      value={ledgerName}
                      onChange={(e) => setLedgerName(e.target.value)}
                      required
                      placeholder="e.g., HDFC Bank, Cash"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ledgerGroup">Under Group *</Label>
                    <Select value={ledgerGroup} onValueChange={setLedgerGroup} required>
                      <SelectTrigger id="ledgerGroup">
                        <SelectValue placeholder="Select account group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map(g => (
                          <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="openingBalance">Opening Balance</Label>
                      <Input
                        id="openingBalance"
                        type="number"
                        step="0.01"
                        value={openingBalance}
                        onChange={(e) => setOpeningBalance(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="balanceType">Balance Type</Label>
                      <Select value={balanceType} onValueChange={(v) => setBalanceType(v as "Dr" | "Cr")}>
                        <SelectTrigger id="balanceType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dr">Debit (Dr)</SelectItem>
                          <SelectItem value="Cr">Credit (Cr)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        id="gstEnabled"
                        checked={gstEnabled}
                        onChange={(e) => setGstEnabled(e.target.checked)}
                        className="rounded border-input"
                      />
                      <Label htmlFor="gstEnabled" className="cursor-pointer">GST Applicable</Label>
                    </div>
                    
                    {gstEnabled && (
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
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateLedgerOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Ledger</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-8">
          <div className="max-w-5xl mx-auto">
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

            <Tabs defaultValue="tree">
              <TabsList>
                <TabsTrigger value="tree">Hierarchical View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>

              <TabsContent value="tree" className="mt-6">
                <Card className="p-6">
                  {groups.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No account groups found. Create your first group.</p>
                      <Button onClick={() => setIsCreateGroupOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Group
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {renderGroupTree()}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="list" className="mt-6">
                <Card className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-lg mb-3">Groups ({groups.length})</h3>
                      <div className="border rounded">
                        <table className="tally-table">
                          <thead>
                            <tr>
                              <th>Group Name</th>
                              <th>Parent Group</th>
                              <th>Group Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groups.map(group => {
                              const parent = groups.find(g => g.id === group.parent_id);
                              return (
                                <tr key={group.id}>
                                  <td>{group.name}</td>
                                  <td>{parent?.name || "Primary"}</td>
                                  <td>{group.group_type}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-3">Ledgers ({ledgers.length})</h3>
                      <div className="border rounded">
                        <table className="tally-table">
                          <thead>
                            <tr>
                              <th>Ledger Name</th>
                              <th>Group</th>
                              <th>Opening Balance</th>
                              <th>GST</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ledgers.map(ledger => {
                              const group = groups.find(g => g.id === ledger.group_id);
                              return (
                                <tr key={ledger.id}>
                                  <td>{ledger.name}</td>
                                  <td>{group?.name || "-"}</td>
                                  <td className="text-right">
                                    {ledger.opening_balance && Number(ledger.opening_balance) > 0 
                                      ? `${Number(ledger.opening_balance).toFixed(2)} ${ledger.balance_type}`
                                      : "-"}
                                  </td>
                                  <td>{ledger.gst_applicable ? ledger.gstin || "Yes" : "-"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
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