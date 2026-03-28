import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const Stats = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);
  if (!user) return null;

  const stats = [
    { label: "Total Income", value: "$7,042.50", icon: TrendingUp, change: "+12.5%", color: "text-success" },
    { label: "Total Expenses", value: "$721.29", icon: TrendingDown, change: "-3.2%", color: "text-destructive" },
    { label: "Net Balance", value: "$832,000", icon: DollarSign, change: "+8.1%", color: "text-success" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 flex items-center gap-3 text-primary-foreground">
        <button onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="font-bold text-lg">Statistics</h1>
      </header>
      <div className="px-4 py-6 space-y-3 animate-fade-in">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl shadow-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><s.icon size={22} className="text-primary" /></div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold text-card-foreground">{s.value}</p>
            </div>
            <span className={`text-xs font-medium ${s.color}`}>{s.change}</span>
          </div>
        ))}
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-bold text-card-foreground mb-3 flex items-center gap-2"><BarChart3 size={18} className="text-primary" /> Monthly Overview</h3>
          <div className="space-y-2">
            {["Jan","Feb","Mar"].map((m, i) => (
              <div key={m} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-8">{m}</span>
                <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                  <div className="gradient-primary h-full rounded-full" style={{ width: `${[65, 80, 72][i]}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <footer className="text-center text-xs text-muted-foreground py-4">© 2026 Silicon Valley Bank. All Rights Reserved.</footer>
    </div>
  );
};

export default Stats;
