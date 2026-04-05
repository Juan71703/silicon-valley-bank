import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Send, CheckCircle, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { COUNTRY_LIST, getCountryBankingFields } from "@/data/countries";

type TransferStep = "form" | "confirm" | "pin" | "itc" | "complete";

const Transfer = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<TransferStep>("form");
  const [country, setCountry] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({});
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [pin, setPin] = useState("");
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
    setBankName("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!country || !accountName.trim() || !bankName.trim() || !amount.trim() || !reason.trim()) {
      toast.error(t("transfer.fillFields")); return;
    }
    for (const field of bankingFields) {
      if (!dynamicFields[field.key]?.trim()) {
        toast.error(`${t("transfer.pleaseEnter")} ${field.label}`); return;
      }
    }
    if (isNaN(amt) || amt <= 0) { toast.error(t("transfer.invalidAmount")); return; }
    if (total > user.balance) { toast.error(t("transfer.insufficientBalance")); return; }
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (!user.pin) {
      toast.error(t("transfer.setPinFirst"));
      return;
    }
    setStep("pin");
  };

  const handlePinVerify = () => {
    if (pin !== user.pin) {
      toast.error(t("transfer.invalidPin"));
      setPin("");
      return;
    }
    // Generate OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    toast.info(`${t("transfer.otpSentTo")} ${user.email}`);
    setStep("otp");
  };

  const handleOtpVerify = () => {
    if (otp !== generatedOtp) {
      toast.error(t("transfer.invalidOtp"));
      return;
    }
    setStep("complete");
  };

  const handleReset = () => {
    setStep("form");
    setCountry(""); setAccountName(""); setBankName(""); setDynamicFields({}); setAmount(""); setReason(""); setPin(""); setOtp("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 flex items-center gap-3 text-primary-foreground">
        <button onClick={() => step === "form" ? navigate(-1) : setStep("form")}><ArrowLeft size={22} /></button>
        <h1 className="font-bold text-lg">{t("page.transfer")}</h1>
      </header>
      <div className="px-4 py-6 animate-fade-in">
        {step === "form" && (
          <div className="bg-card rounded-2xl shadow-card p-5">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label className="text-card-foreground">{t("transfer.destCountry")}</Label>
                <Select value={country} onValueChange={handleCountryChange}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder={t("transfer.country")} /></SelectTrigger>
                  <SelectContent>
                    {COUNTRY_LIST.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-card-foreground">{t("transfer.recipient")}</Label>
                <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder={t("transfer.recipientPlaceholder")} className="mt-1" />
              </div>
              <div>
                <Label className="text-card-foreground">{t("transfer.bankName") || "Bank Name"}</Label>
                <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Chase Bank, Barclays" className="mt-1" />
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
                <Label className="text-card-foreground">{t("transfer.amount")}</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">{t("balance.available")}: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(user.balance)}</p>
              </div>
              <div>
                <Label className="text-card-foreground">{t("transfer.reason")}</Label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("transfer.reasonPlaceholder")} className="mt-1" />
              </div>
              <Button type="submit" className="w-full"><Send size={18} className="mr-2" /> {t("transfer.continue")}</Button>
            </form>
          </div>
        )}

        {step === "confirm" && (
          <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
            <h2 className="font-bold text-card-foreground text-lg">{t("transfer.confirm")}</h2>
            <p className="text-sm text-muted-foreground">{t("transfer.reviewDetails")}</p>
            <div className="space-y-2 bg-muted rounded-xl p-4">
              <DetailRow label={t("transfer.recipient")} value={accountName} />
              <DetailRow label={t("transfer.destCountry")} value={country} />
              <DetailRow label={t("transfer.bankName") || "Bank Name"} value={bankName} />
              {bankingFields.map(f => (
                <DetailRow key={f.key} label={f.label} value={dynamicFields[f.key] || ""} />
              ))}
              <DetailRow label={t("transfer.amount")} value={`$${amt.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
              <DetailRow label={t("transfer.fee")} value={`$${fee.toFixed(2)}`} />
              <div className="border-t border-border pt-2">
                <DetailRow label={t("transfer.total")} value={`$${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} bold />
              </div>
              <DetailRow label={t("transfer.reason")} value={reason} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>{t("transfer.edit")}</Button>
              <Button className="flex-1" onClick={handleConfirm}>{t("transfer.confirmProceed")}</Button>
            </div>
          </div>
        )}

        {step === "pin" && (
          <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-card-foreground">{t("transfer.enterPin")}</h2>
                <p className="text-xs text-muted-foreground">{t("transfer.enterPinDesc")}</p>
              </div>
            </div>
            <Input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              className="text-center text-2xl tracking-[0.5em]"
              maxLength={4}
            />
            <Button className="w-full" onClick={handlePinVerify} disabled={pin.length !== 4}>
              {t("transfer.verifyPin")}
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertCircle size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-card-foreground">{t("transfer.securityVerification")}</h2>
                <p className="text-xs text-muted-foreground">{t("transfer.otpDesc")}</p>
              </div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
              <p className="text-xs text-amber-700 font-medium">{t("transfer.contactAdmin")}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t("transfer.adminOtpNote")}</p>
            </div>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder={t("transfer.enterOtpPlaceholder")}
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />
            <Button className="w-full" onClick={handleOtpVerify} disabled={otp.length !== 6}>
              {t("transfer.verify")}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {t("transfer.needHelp")}{" "}
              <button className="text-primary font-medium" onClick={() => window.dispatchEvent(new CustomEvent("open-live-chat"))}>{t("transfer.contactSupport")}</button>
            </p>
          </div>
        )}

        {step === "complete" && (
          <div className="bg-card rounded-2xl shadow-card p-5 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-primary" />
            </div>
            <h2 className="font-bold text-card-foreground text-lg">{t("transfer.success")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("transfer.successDesc")} <span className="font-semibold text-card-foreground">${amt.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span> {t("transfer.to")}{" "}
              <span className="font-semibold text-card-foreground">{accountName}</span> {t("transfer.pending")}
            </p>
            <div className="bg-muted rounded-xl p-3 text-xs text-muted-foreground">
              Reference: TXN-{Date.now().toString(36).toUpperCase()}
            </div>
            <Button className="w-full" onClick={handleReset}>{t("transfer.makeAnother")}</Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>{t("transfer.backHome")}</Button>
          </div>
        )}
      </div>
      <footer className="text-center text-xs text-muted-foreground py-4">{t("footer.copyright")}</footer>
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
