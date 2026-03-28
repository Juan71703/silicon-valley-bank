import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Menu, Bell, Eye, EyeOff, Copy, TrendingUp, ArrowUpRight, Send, FileText,
  CreditCard, Building2, Settings, Headphones, X, Home, BarChart3, User, Grid3X3,
  ChevronRight, Receipt
} from "lucide-react";
import svbLogo from "@/assets/svb-logo.png";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  if (!user) return null;

  const greeting = currentTime.getHours() < 12 ? "Good Morning" : currentTime.getHours() < 17 ? "Good Afternoon" : "Good Evening";
  const maskedAccount = user.accountNumber.slice(0, 5) + "•••";
  const formattedBalance = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(user.balance);
  const timeStr = currentTime.toLocaleTimeString("en-US", { hour12: false });
  const dateStr = currentTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const menuItems = [
    { icon: Building2, label: "Account Overview", path: "/account" },
    { icon: TrendingUp, label: "Transactions", path: "/transactions" },
    { icon: Send, label: "Transfer Money", path: "/transfer" },
    { icon: CreditCard, label: "Cards", path: "/cards" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: Headphones, label: "Contact Support", path: "/contact" },
  ];

  const quickActions = [
    { icon: Building2, label: "Account Info", path: "/account", color: "bg-muted" },
    { icon: Send, label: "Send Money", path: "/transfer", color: "bg-accent/10" },
    { icon: Receipt, label: "Pay Bills", path: "/transfer", color: "bg-muted" },
    { icon: FileText, label: "Transactions", path: "/transactions", color: "bg-accent/10" },
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
            <button onClick={() => { logout(); navigate("/login"); }}
              className="mt-4 w-full py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
              Sign Out
            </button>
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
          <button className="relative text-muted-foreground">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
          </button>
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            {user.firstName[0]}
          </div>
        </div>
      </header>

      {/* Greeting + Balance Card */}
      <div className="gradient-primary mx-4 mt-4 rounded-2xl p-5 text-primary-foreground animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-bold">
              {user.firstName[0]}
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
            <p className="text-sm opacity-80">Available Balance</p>
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
              <p className="text-xs opacity-70">Your Account Number</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{maskedAccount}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-foreground/20 text-primary-foreground">
                  ● {user.accountStatus}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <button onClick={() => navigate("/transactions")}
              className="text-xs bg-primary-foreground/20 hover:bg-primary-foreground/30 px-3 py-1 rounded-full flex items-center gap-1 transition-colors">
              <ArrowUpRight size={12} /> Transactions
            </button>
            <button className="text-xs bg-primary-foreground/20 hover:bg-primary-foreground/30 px-3 py-1 rounded-full flex items-center gap-1 transition-colors">
              <CreditCard size={12} /> Top up
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6 animate-slide-up">
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h2 className="font-bold text-card-foreground mb-1">What would you like to do today?</h2>
          <p className="text-xs text-muted-foreground mb-4">Choose from our popular actions below</p>
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

      {/* Footer */}
      <div className="px-4 mt-6 text-center">
        <p className="text-xs text-muted-foreground">© 2026 Silicon Valley Bank. All Rights Reserved.</p>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elevated">
        <div className="flex items-center justify-around py-2 relative max-w-md mx-auto">
          <NavItem icon={Home} label="Home" active onClick={() => navigate("/dashboard")} />
          <NavItem icon={BarChart3} label="Stats" onClick={() => navigate("/stats")} />
          {/* Floating center button */}
          <div className="relative -top-5">
            <button className="w-14 h-14 rounded-full gradient-primary shadow-elevated flex items-center justify-center text-primary-foreground"
              onClick={() => setMenuOpen(true)}>
              <Grid3X3 size={22} />
            </button>
          </div>
          <NavItem icon={CreditCard} label="Cards" onClick={() => navigate("/cards")} />
          <NavItem icon={User} label="Profile" onClick={() => navigate("/settings")} />
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
