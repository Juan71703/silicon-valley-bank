import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, LogIn, ArrowLeft, Mail, Globe } from "lucide-react";
import svbLogo from "@/assets/svb-logo.png";

type LoginView = "login" | "forgot-email" | "forgot-sent";

const Login = () => {
  const { login, resetPassword } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [view, setView] = useState<LoginView>("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) { setError(t("login.fillAll")); return; }
    setLoading(true);
    const result = await login(email, password, rememberMe);
    setLoading(false);
    if (result.success) { navigate("/dashboard"); } else { setError(result.error || t("login.invalid")); }
  };

  const handleForgotSubmitEmail = async () => {
    setResetError("");
    if (!resetEmail.trim()) { setResetError(t("login.fillAll")); return; }
    setLoading(true);
    const success = await resetPassword(resetEmail);
    setLoading(false);
    if (success) {
      setView("forgot-sent");
    } else {
      setResetError("Failed to send reset email. Please try again.");
    }
  };

  // Forgot password flow screens
  if (view !== "login") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-primary px-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex flex-col items-center mb-8">
            <img src={svbLogo} alt="Silicon Valley Bank" width={64} height={64} className="mb-3" />
            <h1 className="text-2xl font-bold text-primary-foreground">{t("login.resetPassword")}</h1>
          </div>

          <div className="bg-card rounded-2xl shadow-elevated p-6">
            {view === "forgot-email" && (
              <>
                <p className="text-sm text-muted-foreground mb-4">{t("login.resetDesc")}</p>
                {resetError && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 mb-4">{resetError}</div>}
                <div className="mb-4">
                  <Label className="text-card-foreground">{t("login.email")}</Label>
                  <Input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="mt-1" placeholder="you@example.com" />
                </div>
                <Button onClick={handleForgotSubmitEmail} className="w-full mb-3" disabled={loading}>
                  {loading ? "Sending..." : t("login.sendCode")}
                </Button>
                <button onClick={() => setView("login")} className="text-sm text-muted-foreground hover:text-card-foreground flex items-center gap-1">
                  <ArrowLeft size={14} /> {t("login.backToLogin")}
                </button>
              </>
            )}

            {view === "forgot-sent" && (
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Mail size={32} className="text-primary" />
                </div>
                <h3 className="font-bold text-card-foreground mb-2">Check Your Email</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We've sent a password reset link to <span className="font-medium text-card-foreground">{resetEmail}</span>. 
                  Please check your inbox and follow the instructions to reset your password.
                </p>
                <button onClick={() => { setView("login"); setResetEmail(""); }} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                  <ArrowLeft size={14} /> {t("login.backToLogin")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-primary px-4 relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setShowLangMenu(!showLangMenu)}
          className="flex items-center gap-1.5 bg-card/20 backdrop-blur-sm text-primary-foreground rounded-full px-3 py-2 text-sm hover:bg-card/30 transition-colors"
        >
          <Globe size={16} />
          {LANGUAGES.find(l => l.code === lang)?.label || "English"}
        </button>
        {showLangMenu && (
          <div className="absolute right-0 mt-1 bg-card rounded-xl shadow-elevated border border-border py-1 min-w-[140px] animate-fade-in">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setShowLangMenu(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${lang === l.code ? "text-primary font-medium" : "text-card-foreground"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>

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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">{t("login.rememberMe")}</Label>
              </div>
              <button type="button" onClick={() => setView("forgot-email")} className="text-sm text-primary font-medium hover:underline">
                {t("login.forgotPassword")}
              </button>
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
