import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { COUNTRY_LIST, getCountryBankingFields } from "@/data/countries";

type TransferStep = "form" | "confirm" | "otp" | "complete";

const Transfer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<TransferStep>("form");
  const [country, setCountry] = useState("");
  const [accountName, setAccountName] = useState("");
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({});
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);
  if (!user) return null;

  const bankingFields = country ? getCountryBankingFields(country) : [];
  const amt = parseFloat(amount) || 0;
  const fee = amt > 0 ? Math.max(amt * 0.001, 1.50) : 0;
  const total = amt + fee;

  const handleCountryChange = (val: string) => {
    setCountry(val);
    setDynamicFields({});
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!country || !accountName.trim() || !amount.trim() || !reason.trim()) {
      toast.error("Please fill in all required fields"); return;
    }
    for (const field of bankingFields) {
      if (!dynamicFields[field.key]?.trim()) {
        toast.error(`Please enter ${field.label}`); return;
      }
    }
    if (isNaN(amt) || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (total > user.balance) { toast.error("Insufficient balance"); return; }
    setStep("confirm");
  };

  const handleConfirm = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    toast.info(`Verification code sent to ${user.email}: ${code}`);
    setStep("otp");
  };

  const handleOtpVerify = () => {
    if (otp !== generatedOtp) {
      toast.error("Invalid verification code");
      return;
    }
    setStep("complete");
  };

  const handleReset = () => {
    setStep("form");
    setCountry(""); setAccountName(""); setDynamicFields({}); setAmount(""); setReason(""); setOtp("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 flex items-center gap-3 text-primary-foreground">
        <button onClick={() => step === "form" ? navigate(-1) : setStep("form")}><ArrowLeft size={22} /></button>
        <h1 className="font-bold text-lg">Send Money</h1>
      </header>
      <div className="px-4 py-6 animate-fade-in">
        {step === "form" && (
          <div className="bg-card rounded-2xl shadow-card p-5">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label className="text-card-foreground">Destination Country</Label>
                <Select value={country} onValueChange={handleCountryChange}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select country" /></SelectTrigger>
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
              <Button type="submit" className="w-full"><Send size={18} className="mr-2" /> Continue</Button>
            </form>
          </div>
        )}

        {step === "confirm" && (
          <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
            <h2 className="font-bold text-card-foreground text-lg">Confirm Transfer</h2>
            <p className="text-sm text-muted-foreground">Please review the details below before proceeding.</p>
            <div className="space-y-2 bg-muted rounded-xl p-4">
              <DetailRow label="Recipient" value={accountName} />
              <DetailRow label="Country" value={country} />
              {bankingFields.map(f => (
                <DetailRow key={f.key} label={f.label} value={dynamicFields[f.key] || ""} />
              ))}
              <DetailRow label="Amount" value={`$${amt.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
              <DetailRow label="Transfer Fee" value={`$${fee.toFixed(2)}`} />
              <div className="border-t border-border pt-2">
                <DetailRow label="Total" value={`$${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} bold />
              </div>
              <DetailRow label="Reason" value={reason} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>Edit</Button>
              <Button className="flex-1" onClick={handleConfirm}>Confirm & Verify</Button>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertCircle size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-card-foreground">Security Verification</h2>
                <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to your email</p>
              </div>
            </div>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit code"
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />
            <Button className="w-full" onClick={handleOtpVerify} disabled={otp.length !== 6}>
              Verify & Send
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Didn't receive it?{" "}
              <button className="text-primary font-medium" onClick={handleConfirm}>Resend code</button>
            </p>
          </div>
        )}

        {step === "complete" && (
          <div className="bg-card rounded-2xl shadow-card p-5 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-primary" />
            </div>
            <h2 className="font-bold text-card-foreground text-lg">Transaction Pending Review</h2>
            <p className="text-sm text-muted-foreground">
              Your transfer of <span className="font-semibold text-card-foreground">${amt.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span> to{" "}
              <span className="font-semibold text-card-foreground">{accountName}</span> is being processed.
            </p>
            <div className="bg-muted rounded-xl p-3 text-xs text-muted-foreground">
              Reference: TXN-{Date.now().toString(36).toUpperCase()}
            </div>
            <Button className="w-full" onClick={handleReset}>Make Another Transfer</Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        )}
      </div>
      <footer className="text-center text-xs text-muted-foreground py-4">© 2026 Silicon Valley Bank. All Rights Reserved.</footer>
    </div>
  );
};

const DetailRow = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className={`text-card-foreground ${bold ? "font-bold" : "font-medium"}`}>{value}</span>
  </div>
);

export default Transfer;
