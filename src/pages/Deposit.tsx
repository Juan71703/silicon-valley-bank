import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Building2, Bitcoin, ChevronRight, X, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import LiveChatButton from "@/components/LiveChatButton";

type DepositMethod = null | "card" | "bank" | "bitcoin";

const DEMO_BTC_ADDRESS = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

const Deposit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<DepositMethod>(null);

  // Card state
  const [selectedCardType, setSelectedCardType] = useState<"" | "visa" | "mastercard">("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [cardLoading, setCardLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;
  const detectCardType = (num: string) => {
    const clean = num.replace(/\s/g, "");
    if (/^4/.test(clean)) return "visa";
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return "mastercard";
    return "unknown";
  };

  const formatCardNumber = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 16);
    return clean.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 4);
    if (clean.length >= 3) return clean.slice(0, 2) + "/" + clean.slice(2);
    return clean;
  };

  const handleCardDeposit = () => {
    const clean = cardNumber.replace(/\s/g, "");
    if (clean.length !== 16) { toast.error("Enter a valid 16-digit card number"); return; }
    if (cardType === "unknown") { toast.error("Only Visa and MasterCard are accepted"); return; }
    if (cardExpiry.length !== 5) { toast.error("Enter a valid expiry date (MM/YY)"); return; }
    if (cardCvv.length < 3) { toast.error("Enter a valid CVV"); return; }
    if (!cardAmount || parseFloat(cardAmount) <= 0) { toast.error("Enter a valid amount"); return; }
    setCardLoading(true);
    setTimeout(() => {
      setCardLoading(false);
      toast.success(`$${parseFloat(cardAmount).toLocaleString()} deposited successfully via ${cardType === "visa" ? "Visa" : "MasterCard"}!`);
      setMethod(null);
      setCardNumber(""); setCardExpiry(""); setCardCvv(""); setCardAmount("");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="gradient-primary px-4 py-4 flex items-center gap-3 text-primary-foreground">
        <button onClick={() => method ? setMethod(null) : navigate("/dashboard")}><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold">{method ? (method === "card" ? "Card Payment" : method === "bank" ? "Bank Transfer" : "Bitcoin Deposit") : "Deposit Funds"}</h1>
      </header>

      <div className="px-4 mt-4 animate-fade-in">
        {!method && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-2">Choose a deposit method</p>

            <button onClick={() => setMethod("card")}
              className="w-full bg-card rounded-2xl shadow-card p-4 flex items-center gap-4 hover:shadow-elevated transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard size={24} className="text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-card-foreground">Card Payment</p>
                <p className="text-xs text-muted-foreground">Visa & MasterCard accepted</p>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </button>

            <button onClick={() => setMethod("bank")}
              className="w-full bg-card rounded-2xl shadow-card p-4 flex items-center gap-4 hover:shadow-elevated transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 size={24} className="text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-card-foreground">Bank Transfer</p>
                <p className="text-xs text-muted-foreground">Transfer to your account number</p>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </button>

            <button onClick={() => setMethod("bitcoin")}
              className="w-full bg-card rounded-2xl shadow-card p-4 flex items-center gap-4 hover:shadow-elevated transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Bitcoin size={24} className="text-amber-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-card-foreground">Bitcoin</p>
                <p className="text-xs text-muted-foreground">Deposit via BTC wallet</p>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Card Payment */}
        {method === "card" && (
          <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${cardType === "visa" ? "bg-primary/10 border-primary text-primary" : "bg-muted border-border text-muted-foreground"}`}>
                  VISA
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${cardType === "mastercard" ? "bg-primary/10 border-primary text-primary" : "bg-muted border-border text-muted-foreground"}`}>
                  MasterCard
                </div>
              </div>
            </div>

            <div>
              <Label className="text-card-foreground text-xs">Card Number</Label>
              <Input
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  setCardNumber(formatted);
                  setCardType(detectCardType(formatted));
                }}
                className="mt-1"
                maxLength={19}
              />
              {cardNumber.replace(/\s/g, "").length >= 2 && cardType === "unknown" && (
                <p className="text-xs text-destructive mt-1">Only Visa and MasterCard are accepted</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-card-foreground text-xs">Expiry Date</Label>
                <Input
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                  className="mt-1"
                  maxLength={5}
                />
              </div>
              <div>
                <Label className="text-card-foreground text-xs">CVV</Label>
                <Input
                  type="password"
                  placeholder="•••"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="mt-1"
                  maxLength={4}
                />
              </div>
            </div>

            <div>
              <Label className="text-card-foreground text-xs">Amount (USD)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={cardAmount}
                onChange={(e) => setCardAmount(e.target.value)}
                className="mt-1"
                min="1"
              />
            </div>

            <Button onClick={handleCardDeposit} className="w-full" disabled={cardLoading}>
              {cardLoading ? "Processing..." : "Proceed with Deposit"}
            </Button>
          </div>
        )}

        {/* Bank Transfer */}
        {method === "bank" && (
          <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
            <div className="text-center mb-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Building2 size={28} className="text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Make a bank transfer to your account number below</p>
            </div>

            <div className="bg-muted rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Bank Name</span>
                <span className="text-sm font-medium text-card-foreground">Silicon Valley Bank</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Account Name</span>
                <span className="text-sm font-medium text-card-foreground">{user.firstName} {user.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Account Number</span>
                <span className="text-sm font-bold text-primary">{user.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Routing Number</span>
                <span className="text-sm font-medium text-card-foreground">121140399</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Account Type</span>
                <span className="text-sm font-medium text-card-foreground">Checking</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Funds will be credited within 1-3 business days after transfer.
            </p>

            <Button variant="outline" className="w-full" onClick={() => {
              navigator.clipboard.writeText(user.accountNumber);
              toast.success("Account number copied!");
            }}>
              Copy Account Number
            </Button>
          </div>
        )}

        {/* Bitcoin */}
        {method === "bitcoin" && (
          <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
            <div className="text-center mb-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
                <Bitcoin size={28} className="text-amber-500" />
              </div>
              <p className="text-sm text-muted-foreground">Send Bitcoin to the wallet address below</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-xl shadow-card">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=bitcoin:${DEMO_BTC_ADDRESS}`}
                  alt="Bitcoin QR Code"
                  className="w-44 h-44"
                />
              </div>
            </div>

            <div className="bg-muted rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Bitcoin Wallet Address</p>
              <p className="text-xs font-mono font-medium text-card-foreground break-all">{DEMO_BTC_ADDRESS}</p>
            </div>

            <Button variant="outline" className="w-full" onClick={() => {
              navigator.clipboard.writeText(DEMO_BTC_ADDRESS);
              toast.success("BTC address copied!");
            }}>
              Copy Wallet Address
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Only send BTC to this address. Sending other cryptocurrencies may result in loss of funds.
            </p>
          </div>
        )}
      </div>
      <LiveChatButton />
    </div>
  );
};

export default Deposit;
