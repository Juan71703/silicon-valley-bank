import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, CreditCard, Wifi, Lock } from "lucide-react";

const Cards = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 flex items-center gap-3 text-primary-foreground">
        <button onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="font-bold text-lg">{t("page.cards")}</h1>
      </header>
      <div className="px-4 py-6 animate-fade-in">
        <div className="gradient-primary rounded-2xl p-6 text-primary-foreground shadow-elevated aspect-[1.6/1] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="text-xs opacity-70">Silicon Valley Bank</div>
            <Wifi size={22} className="rotate-90 opacity-70" />
          </div>
          <div>
            <p className="text-lg tracking-[0.2em] font-mono mb-2">•••• •••• •••• {user.accountNumber.slice(-4)}</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] opacity-60">CARD HOLDER</p>
                <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-[10px] opacity-60">EXPIRES</p>
                <p className="text-sm font-semibold">12/28</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {[
            { label: "Card Status", value: "Active", icon: CreditCard },
            { label: "Card Type", value: "Visa Debit", icon: CreditCard },
            { label: "Security", value: "3D Secure Enabled", icon: Lock },
          ].map((item) => (
            <div key={item.label} className="bg-card rounded-xl shadow-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><item.icon size={18} className="text-primary" /></div>
              <div className="flex-1"><p className="text-xs text-muted-foreground">{item.label}</p><p className="text-sm font-medium text-card-foreground">{item.value}</p></div>
            </div>
          ))}
        </div>
      </div>
      <footer className="text-center text-xs text-muted-foreground py-4">{t("footer.copyright")}</footer>
    </div>
  );
};

export default Cards;
