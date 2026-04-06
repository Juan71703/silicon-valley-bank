import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import {
  Menu, Bell, Eye, EyeOff, Copy, TrendingUp, ArrowUpRight, Send, FileText,
  CreditCard, Building2, Settings, Headphones, X, Home, BarChart3, User, Grid3X3,
  ChevronRight, Plus, Globe, MessageCircle, ArrowDownLeft
} from "lucide-react";
import svbLogo from "@/assets/svb-logo.png";


const MOCK_TRANSACTIONS = [
  { id: "1", type: "credit" as const, desc: "Salary Deposit", amount: 5200, date: "2026-03-27", status: "Completed" },
  { id: "2", type: "debit" as const, desc: "Netflix Subscription", amount: -15.99, date: "2026-03-26", status: "Completed" },
  { id: "3", type: "debit" as const, desc: "Transfer to Jane Doe", amount: -500, date: "2026-03-25", status: "Pending" },
  { id: "4", type: "credit" as const, desc: "Refund - Amazon", amount: 42.5, date: "2026-03-24", status: "Completed" },
  { id: "5", type: "debit" as const, desc: "Electricity Bill", amount: -120, date: "2026-03-23", status: "Completed" },
  { id: "6", type: "credit" as const, desc: "Freelance Payment", amount: 1800, date: "2026-03-21", status: "Completed" },
];

const Dashboard = () => {
  const { user, logout, updateAvatar } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  if (!user) return null;

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? t("greeting.morning") : hour < 17 ? t("greeting.afternoon") : t("greeting.evening");
  const maskedAccount = user.accountNumber.slice(0, 5) + "•••";
  const formattedBalance = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(user.balance);
  const timeStr = currentTime.toLocaleTimeString("en-US", { hour12: false });
  const dateStr = currentTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) { alert("Only JPEG and PNG images are allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image must be less than 5MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => updateAvatar(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const menuItems = [
    { icon: Building2, label: t("menu.accountOverview"), path: "/account" },
    { icon: TrendingUp, label: t("menu.transactions"), path: "/transactions" },
    { icon: Send, label: t("menu.transferMoney"), path: "/transfer" },
    { icon: CreditCard, label: t("menu.cards"), path: "/cards" },
    { icon: Settings, label: t("menu.settings"), path: "/settings" },
    { icon: Headphones, label: t("menu.contactSupport"), path: "/contact" },
  ];

  const quickActions = [
    { icon: Building2, label: t("action.accountInfo"), path: "/account", color: "bg-muted" },
    { icon: Send, label: t("action.sendMoney"), path: "/transfer", color: "bg-accent/10" },
    { icon: ArrowUpRight, label: t("action.deposit"), path: "/deposit", color: "bg-muted" },
    { icon: FileText, label: t("action.transactionHistory"), path: "/transactions", color: "bg-accent/10" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 relative">
      {/* Side Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMenuOpen(false)} />
          <div className="relative w-72 bg-card h-full shadow-elevated animate-fade-in p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <img src={svbLogo} alt="SVB" width={32} height={32} />
                <span className="font-bold text-card-foreground">SVB</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-muted-foreground"><X size={22} /></button>
            </div>
            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => (
                <button key={item.label} onClick={() => { setMenuOpen(false); navigate(item.path); }}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-card-foreground hover:bg-muted transition-colors text-sm">
                  <item.icon size={20} className="text-primary" />
                  {item.label}
                  <ChevronRight size={16} className="ml-auto text-muted-foreground" />
                </button>
              ))}
            </nav>
            <button onClick={async () => { await logout(); navigate("/login"); }}
              className="mt-4 w-full py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
              {t("menu.signOut")}
            </button>
          </div>
        </div>
      )}

      {/* Notification Panel */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setNotifOpen(false)} />
          <div className="relative w-full max-w-sm bg-card h-full shadow-elevated animate-fade-in overflow-y-auto">
            <div className="gradient-primary p-4 flex items-center justify-between text-primary-foreground sticky top-0 z-10">
              <h2 className="font-bold">{t("notif.title")}</h2>
              <button onClick={() => setNotifOpen(false)}><X size={20} /></button>
            </div>
            <div className="p-4 space-y-2">
              {MOCK_TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="bg-muted rounded-xl p-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.type === "credit" ? "bg-green-500/10" : "bg-destructive/10"}`}>
                    {tx.type === "credit" ? <ArrowDownLeft size={16} className="text-green-500" /> : <ArrowUpRight size={16} className="text-destructive" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">{tx.desc}</p>
                    <p className="text-[10px] text-muted-foreground">{tx.date} · <span className={tx.status === "Pending" ? "text-amber-500" : "text-green-500"}>{tx.status}</span></p>
                  </div>
                  <p className={`text-sm font-bold ${tx.type === "credit" ? "text-green-500" : "text-destructive"}`}>
                    {tx.type === "credit" ? "+" : ""}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-card shadow-card">
        <div className="flex items-center gap-2">
          <button onClick={() => setMenuOpen(true)} className="text-foreground"><Menu size={22} /></button>
          <img src={svbLogo} alt="SVB" width={32} height={32} />
          <div className="leading-none">
            <span className="text-sm font-bold text-primary">Silicon Valley</span>
            <span className="block text-[10px] text-muted-foreground">Bank</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setLangMenuOpen(!langMenuOpen)} className="text-muted-foreground hover:text-primary transition-colors">
              <Globe size={20} />
            </button>
            {langMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-40 bg-card rounded-xl shadow-elevated border border-border z-50 py-1 animate-fade-in">
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setLang(l.code); setLangMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${lang === l.code ? "text-primary font-semibold" : "text-card-foreground"}`}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button onClick={() => setNotifOpen(true)} className="relative text-muted-foreground">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
          </button>
          <div className="relative">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleAvatarUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="relative group">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {user.firstName[0]}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                <Plus size={10} className="text-primary-foreground" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Greeting + Balance Card */}
      <div className="gradient-primary mx-4 mt-4 rounded-2xl p-5 text-primary-foreground animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-bold overflow-hidden">
              {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.firstName[0]}
            </div>
            <div>
              <p className="text-sm opacity-80">{greeting}</p>
              <p className="font-bold">{user.firstName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums">{timeStr}</p>
            <p className="text-[10px] opacity-70">{dateStr}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-80">{t("balance.available")}</p>
            <button onClick={() => setShowBalance(!showBalance)} className="opacity-70">
              {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-3xl font-bold mt-1">
            {showBalance ? `${formattedBalance} USD` : "••••••••"}
          </p>
        </div>

        <div className="glass-card rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="opacity-70"><Copy size={16} /></button>
            <div>
              <p className="text-xs opacity-70">{t("account.number")}</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{maskedAccount}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-foreground/20 text-primary-foreground">
                  ● {user.accountStatus}
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate("/transactions")}
            className="text-xs bg-primary-foreground/20 hover:bg-primary-foreground/30 px-3 py-1 rounded-full flex items-center gap-1 transition-colors">
            <ArrowUpRight size={12} /> {t("menu.transactions")}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6 animate-slide-up">
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h2 className="font-bold text-card-foreground mb-1">{t("dashboard.whatToDo")}</h2>
          <p className="text-xs text-muted-foreground mb-4">{t("dashboard.chooseActions")}</p>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button key={action.label} onClick={() => navigate(action.path)}
                className={`${action.color} rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-card transition-shadow`}>
                <action.icon size={24} className="text-primary" />
                <span className="text-sm font-medium text-card-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Account Statistics - Blue bg, white text, always visible */}
      <div className="px-4 mt-6 animate-slide-up">
        <div className="bg-primary rounded-2xl shadow-card p-4 space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <BarChart3 size={20} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-primary-foreground">{t("stats.title")}</span>
          </div>
          <div className="flex items-center justify-between bg-primary-foreground/10 rounded-xl p-3">
            <div>
              <p className="text-xs text-primary-foreground/70">{t("stats.transactionLimit")}</p>
              <p className="text-xl font-bold text-primary-foreground">$500,000.00</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <TrendingUp size={18} className="text-primary-foreground" />
            </div>
          </div>
          <div className="flex items-center justify-between bg-primary-foreground/10 rounded-xl p-3">
            <div>
              <p className="text-xs text-primary-foreground/70">{t("stats.pendingTransactions")}</p>
              <p className="text-xl font-bold text-primary-foreground">$0.00</p>
              <p className="text-[10px] text-primary-foreground/60">{t("stats.noPending")}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <FileText size={18} className="text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Need Help? Contact Support */}
      <div className="px-4 mt-4 animate-slide-up">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-live-chat"))}
          className="w-full bg-card rounded-2xl shadow-card p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageCircle size={20} className="text-primary" />
          </div>
          <div className="text-left">
            <p className="font-bold text-card-foreground text-sm">{t("support.title")}</p>
            <p className="text-xs text-muted-foreground">{t("support.subtitle")}</p>
          </div>
          <ChevronRight size={18} className="ml-auto text-muted-foreground" />
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 mt-6 text-center">
        <p className="text-xs text-muted-foreground">{t("footer.copyright")}</p>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elevated">
        <div className="flex items-center justify-around py-2 relative max-w-md mx-auto">
          <NavItem icon={Home} label={t("nav.home")} active onClick={() => navigate("/dashboard")} />
          <NavItem icon={BarChart3} label={t("nav.stats")} onClick={() => navigate("/stats")} />
          <div className="relative -top-5">
            <button className="w-14 h-14 rounded-full gradient-primary shadow-elevated flex items-center justify-center text-primary-foreground"
              onClick={() => setMenuOpen(true)}>
              <Grid3X3 size={22} />
            </button>
          </div>
          <NavItem icon={CreditCard} label={t("nav.cards")} onClick={() => navigate("/cards")} />
          <NavItem icon={User} label={t("nav.profile")} onClick={() => navigate("/settings")} />
        </div>
      </nav>
      
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any; label: string; active?: boolean; onClick?: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${active ? "text-primary" : "text-muted-foreground"}`}>
    <Icon size={20} />
    <span className="text-[10px]">{label}</span>
  </button>
);

export default Dashboard;
