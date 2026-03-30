import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, LogIn, ArrowLeft, ShieldCheck } from "lucide-react";
import svbLogo from "@/assets/svb-logo.png";

type LoginView = "login" | "forgot-email" | "forgot-code" | "forgot-newpw";

const Login = () => {
  const { login, resetPassword, verifyResetCode, completePasswordReset } = useAuth();
  const { t } = useLanguage();
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
  const [resetCode, setResetCode] = useState("");
  const [generatedResetCode, setGeneratedResetCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [resetError, setResetError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) { setError(t("login.fillAll")); return; }
    setLoading(true);
    const success = await login(email, password, rememberMe);
    setLoading(false);
    if (success) { navigate("/dashboard"); } else { setError(t("login.invalid")); }
  };

  const handleForgotSubmitEmail = () => {
    setResetError("");
    if (!resetEmail.trim()) { setResetError(t("login.fillAll")); return; }
    const code = resetPassword(resetEmail);
    if (code) {
      setGeneratedResetCode(code);
      setView("forgot-code");
    } else {
      setResetError(t("login.emailNotFound"));
    }
  };

  const handleForgotVerifyCode = () => {
    setResetError("");
    if (resetCode !== generatedResetCode) { setResetError(t("login.invalidCode")); return; }
    setView("forgot-newpw");
  };

  const handleForgotNewPassword = () => {
    setResetError("");
    if (newPw.length < 8) { setResetError(t("settings.passwordTooShort")); return; }
    if (newPw !== confirmPw) { setResetError(t("settings.passwordMismatch")); return; }
    completePasswordReset(resetEmail, newPw);
    setView("login");
    setResetEmail(""); setResetCode(""); setNewPw(""); setConfirmPw("");
    setError("");
    alert(t("login.passwordResetSuccess"));
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
                <Button onClick={handleForgotSubmitEmail} className="w-full mb-3">{t("login.sendCode")}</Button>
                <button onClick={() => setView("login")} className="text-sm text-muted-foreground hover:text-card-foreground flex items-center gap-1">
                  <ArrowLeft size={14} /> {t("login.backToLogin")}
                </button>
              </>
            )}

            {view === "forgot-code" && (
              <>
                <div className="flex flex-col items-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <ShieldCheck size={28} className="text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">{t("login.codeSentTo")} <span className="font-medium text-card-foreground">{resetEmail}</span></p>
                </div>
                {/* Demo code display */}
                <div className="bg-accent/10 border border-primary/20 rounded-lg p-3 mb-4 text-center">
                  <p className="text-xs text-muted-foreground">Demo: Reset code</p>
                  <p className="text-2xl font-bold text-primary tracking-[0.3em] mt-1">{generatedResetCode}</p>
                </div>
                {resetError && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 mb-4">{resetError}</div>}
                <div className="mb-4">
                  <Label className="text-card-foreground text-xs">{t("login.enterCode")}</Label>
                  <Input maxLength={6} value={resetCode} onChange={e => setResetCode(e.target.value.replace(/\D/g, ""))} className="mt-1 text-center text-xl tracking-[0.3em] font-bold" placeholder="000000" />
                </div>
                <Button onClick={handleForgotVerifyCode} className="w-full" disabled={resetCode.length !== 6}>{t("login.verifyCode")}</Button>
              </>
            )}

            {view === "forgot-newpw" && (
              <>
                <p className="text-sm text-muted-foreground mb-4">{t("login.enterNewPassword")}</p>
                {resetError && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 mb-4">{resetError}</div>}
                <div className="mb-3">
                  <Label className="text-card-foreground text-xs">{t("settings.newPassword")}</Label>
                  <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="mt-1" />
                </div>
                <div className="mb-4">
                  <Label className="text-card-foreground text-xs">{t("settings.confirmNewPassword")}</Label>
                  <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="mt-1" />
                </div>
                <Button onClick={handleForgotNewPassword} className="w-full">{t("settings.updatePassword")}</Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

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
