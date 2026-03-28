import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Transfer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);
  if (!user) return null;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !amount.trim()) { toast.error("Please fill in all required fields"); return; }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (amt > user.balance) { toast.error("Insufficient balance"); return; }
    toast.success(`$${amt.toLocaleString()} sent successfully!`);
    setRecipient(""); setAmount(""); setNote("");
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
              <Label className="text-card-foreground">Recipient Account Number</Label>
              <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Enter account number" className="mt-1" />
            </div>
            <div>
              <Label className="text-card-foreground">Amount (USD)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Balance: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(user.balance)}</p>
            </div>
            <div>
              <Label className="text-card-foreground">Note (optional)</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What's this for?" className="mt-1" />
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
