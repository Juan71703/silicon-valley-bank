import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, LogIn } from "lucide-react";
import svbLogo from "@/assets/svb-logo.png";

const Login = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) { setError(t("login.fillAll")); return; }
    setLoading(true);
    const success = await login(email, password, rememberMe);
    setLoading(false);
    if (success) { navigate("/dashboard"); } else { setError(t("login.invalid")); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-primary px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <img src={svbLogo} alt="Silicon Valley Bank" width={64} height={64} className="mb-3" />
          <h1 className="text-2xl font-bold text-primary-foreground">Silicon Valley Bank</h1>
          <p className="text-primary-foreground/70 text-sm mt-1">Secure Online Banking</p>
        </div>

        <div className="bg-card rounded-2xl shadow-elevated p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-1">{t("login.title")}</h2>
          <p className="text-muted-foreground text-sm mb-6">{t("login.subtitle")}</p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-card-foreground">{t("login.email")}</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password" className="text-card-foreground">{t("login.password")}</Label>
              <div className="relative mt-1">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">{t("login.rememberMe")}</Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "..." : <><LogIn size={18} className="mr-2" /> {t("login.signIn")}</>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("login.noAccount")}{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">{t("login.register")}</Link>
          </p>
        </div>

        <p className="text-center text-xs text-primary-foreground/50 mt-6">{t("footer.copyright")}</p>
      </div>
    </div>
  );
};

export default Login;
