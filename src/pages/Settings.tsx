import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, User, Globe, Lock, Bell, LogOut, ChevronRight } from "lucide-react";

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);
  if (!user) return null;

  const items = [
    { icon: User, label: t("settings.personalInfo"), sub: t("settings.personalSub") },
    { icon: Globe, label: t("settings.langRegion"), sub: `${user.language} · ${user.country}` },
    { icon: Lock, label: t("settings.security"), sub: t("settings.securitySub") },
    { icon: Bell, label: t("settings.notifications"), sub: t("settings.notificationsSub") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 flex items-center gap-3 text-primary-foreground">
        <button onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="font-bold text-lg">{t("page.settings")}</h1>
      </header>
      <div className="px-4 py-6 animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mb-2">{user.firstName[0]}</div>
          <p className="font-bold text-card-foreground">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <button key={item.label} className="w-full bg-card rounded-xl shadow-card p-4 flex items-center gap-3 hover:shadow-elevated transition-shadow">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><item.icon size={18} className="text-primary" /></div>
              <div className="flex-1 text-left"><p className="text-sm font-medium text-card-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.sub}</p></div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
          <button onClick={() => { logout(); navigate("/login"); }} className="w-full bg-destructive/10 rounded-xl p-4 flex items-center gap-3 mt-4">
            <LogOut size={18} className="text-destructive" />
            <span className="text-sm font-medium text-destructive">{t("settings.signOut")}</span>
          </button>
        </div>
      </div>
      <footer className="text-center text-xs text-muted-foreground py-4">{t("footer.copyright")}</footer>
    </div>
  );
};

export default SettingsPage;
