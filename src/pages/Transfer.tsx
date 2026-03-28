import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { COUNTRY_LIST, getCountryBankingFields } from "@/data/countries";

const Transfer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [country, setCountry] = useState("");
  const [accountName, setAccountName] = useState("");
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({});
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);
  if (!user) return null;

  const bankingFields = country ? getCountryBankingFields(country) : [];

  const handleCountryChange = (val: string) => {
    setCountry(val);
    setDynamicFields({});
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!country || !accountName.trim() || !amount.trim() || !reason.trim()) {
      toast.error("Please fill in all required fields"); return;
    }
    // Check all dynamic fields are filled
    for (const field of bankingFields) {
      if (!dynamicFields[field.key]?.trim()) {
        toast.error(`Please enter ${field.label}`); return;
      }
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (amt > user.balance) { toast.error("Insufficient balance"); return; }
    toast.success(`$${amt.toLocaleString()} sent successfully to ${accountName}!`);
    setCountry(""); setAccountName(""); setDynamicFields({}); setAmount(""); setReason("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 flex items-center gap-3 text-primary-foreground">
        <button onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="font-bold text-lg">Send Money</h1>
      </header>
      <div className="px-4 py-6 animate-fade-in">
        <div className="bg-card rounded-2xl shadow-card p-5">
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <Label className="text-card-foreground">Destination Country</Label>
              <Select value={country} onValueChange={handleCountryChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_LIST.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-card-foreground">Account Holder Name</Label>
              <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Enter recipient's full name" className="mt-1" />
            </div>

            {/* Dynamic country-specific banking fields */}
            {bankingFields.map((field) => (
              <div key={field.key}>
                <Label className="text-card-foreground">{field.label}</Label>
                <Input
                  value={dynamicFields[field.key] || ""}
                  onChange={(e) => setDynamicFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="mt-1"
                />
              </div>
            ))}

            <div>
              <Label className="text-card-foreground">Amount (USD)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Balance: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(user.balance)}</p>
            </div>
            <div>
              <Label className="text-card-foreground">Reason for Transfer</Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Family support, Business payment" className="mt-1" />
            </div>
            <Button type="submit" className="w-full"><Send size={18} className="mr-2" /> Send Money</Button>
          </form>
        </div>
      </div>
      <footer className="text-center text-xs text-muted-foreground py-4">© 2026 Silicon Valley Bank. All Rights Reserved.</footer>
    </div>
  );
};

export default Transfer;
