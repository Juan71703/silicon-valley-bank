import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, CreditCard } from "lucide-react";

const MOCK_TRANSACTIONS = [
  { id: "1", type: "credit" as const, desc: "Salary Deposit", amount: 5200, date: "2026-03-27", category: "Deposit" },
  { id: "2", type: "debit" as const, desc: "Netflix Subscription", amount: -15.99, date: "2026-03-26", category: "Payment" },
  { id: "3", type: "debit" as const, desc: "Transfer to Jane Doe", amount: -500, date: "2026-03-25", category: "Transfer" },
  { id: "4", type: "credit" as const, desc: "Refund - Amazon", amount: 42.5, date: "2026-03-24", category: "Deposit" },
  { id: "5", type: "debit" as const, desc: "Electricity Bill", amount: -120, date: "2026-03-23", category: "Payment" },
  { id: "6", type: "debit" as const, desc: "Grocery Store", amount: -85.3, date: "2026-03-22", category: "Payment" },
  { id: "7", type: "credit" as const, desc: "Freelance Payment", amount: 1800, date: "2026-03-21", category: "Deposit" },
];

const Transactions = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 flex items-center gap-3 text-primary-foreground">
        <button onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="font-bold text-lg">{t("page.transactions")}</h1>
      </header>
      <div className="px-4 py-4 space-y-2 animate-fade-in">
        {MOCK_TRANSACTIONS.map((tx) => (
          <div key={tx.id} className="bg-card rounded-xl shadow-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "credit" ? "bg-success/10" : "bg-destructive/10"}`}>
              {tx.type === "credit" ? <ArrowDownLeft size={18} className="text-success" /> : <ArrowUpRight size={18} className="text-destructive" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground truncate">{tx.desc}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CreditCard size={10} /> {tx.category} · {tx.date}
              </div>
            </div>
            <p className={`text-sm font-bold ${tx.type === "credit" ? "text-success" : "text-destructive"}`}>
              {tx.type === "credit" ? "+" : ""}{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(tx.amount)}
            </p>
          </div>
        ))}
      </div>
      <footer className="text-center text-xs text-muted-foreground py-4">{t("footer.copyright")}</footer>
    </div>
  );
};

export default Transactions;
