import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Copy, Shield } from "lucide-react";

const AccountInfo = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);
  if (!user) return null;

  const details = [
    { label: t("account.fullName"), value: `${user.firstName} ${user.lastName}` },
    { label: t("account.email"), value: user.email },
    { label: t("account.accountNumber"), value: user.accountNumber },
    { label: t("account.status"), value: user.accountStatus },
    { label: t("account.country"), value: user.country },
    { label: t("account.language"), value: user.language },
    { label: t("account.balance"), value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(user.balance) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 flex items-center gap-3 text-primary-foreground">
        <button onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="font-bold text-lg">{t("page.accountInfo")}</h1>
      </header>
      <div className="px-4 py-6 space-y-3 animate-fade-in">
        <div className="bg-card rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">{user.firstName[0]}</div>
            <div>
              <p className="font-bold text-card-foreground">{user.firstName} {user.lastName}</p>
              <div className="flex items-center gap-1 text-xs text-success"><Shield size={12} /> Verified Account</div>
            </div>
          </div>
          {details.map((d) => (
            <div key={d.label} className="flex justify-between items-center py-3 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{d.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-card-foreground">{d.value}</span>
                {d.label === t("account.accountNumber") && <Copy size={14} className="text-primary cursor-pointer" />}
              </div>
            </div>
          ))}
        </div>
      </div>
      <footer className="text-center text-xs text-muted-foreground py-4">{t("footer.copyright")}</footer>
    </div>
  );
};

export default AccountInfo;
