import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, UserPlus, ShieldCheck } from "lucide-react";
import svbLogo from "@/assets/svb-logo.png";

const COUNTRIES = [
  "United States","United Kingdom","Canada","Australia","Germany","France","Japan","India",
  "Brazil","South Africa","Nigeria","Kenya","Ghana","China","South Korea","Mexico",
  "Argentina","Italy","Spain","Netherlands","Sweden","Norway","Denmark","Finland",
  "Switzerland","Austria","Belgium","Ireland","Portugal","New Zealand","Singapore",
  "Malaysia","Thailand","Indonesia","Philippines","Vietnam","Egypt","Morocco","UAE",
  "Saudi Arabia","Turkey","Poland","Czech Republic","Romania","Hungary","Colombia","Chile","Peru",
];

const LANGUAGES = [
  "English","Spanish","French","German","Portuguese","Chinese","Japanese","Korean",
  "Arabic","Hindi","Swahili","Italian","Dutch","Swedish","Norwegian","Danish",
  "Finnish","Polish","Turkish","Russian","Thai","Vietnamese","Indonesian","Malay",
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "", country: "", language: "",
  });
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Verification code state
  const [step, setStep] = useState<"form" | "verify">("form");
  const [generatedCode, setGeneratedCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [verifyError, setVerifyError] = useState("");

  const captcha = useMemo(() => {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    return { question: `${a} + ${b}`, answer: a + b };
  }, []);

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const validate = () => {
    if (Object.values(form).some((v) => !v.trim())) return "All fields are required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Invalid email format";
    if (form.password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(form.password))
      return "Password needs uppercase, number, and special character";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    if (parseInt(captchaAnswer) !== captcha.answer) return "Incorrect CAPTCHA answer";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) { setError(err); return; }
    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setStep("verify");
  };

  const handleVerify = async () => {
    setVerifyError("");
    if (enteredCode.trim() !== generatedCode) {
      setVerifyError("Incorrect verification code. Please try again.");
      return;
    }
    setLoading(true);
    const success = await register({
      firstName: form.firstName, lastName: form.lastName, email: form.email,
      password: form.password, country: form.country, language: form.language,
    });
    setLoading(false);
    if (success) navigate("/dashboard");
    else setError("Registration failed");
  };

  const handleResendCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setEnteredCode("");
    setVerifyError("");
  };

  if (step === "verify") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-primary px-4 py-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex flex-col items-center mb-6">
            <img src={svbLogo} alt="SVB" width={56} height={56} className="mb-2" />
            <h1 className="text-xl font-bold text-primary-foreground">Verify Your Email</h1>
          </div>

          <div className="bg-card rounded-2xl shadow-elevated p-6">
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <ShieldCheck size={32} className="text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                We've sent a 6-digit verification code to <span className="font-medium text-card-foreground">{form.email}</span>
              </p>
            </div>

            {/* Show the code for demo purposes */}
            <div className="bg-accent/10 border border-primary/20 rounded-lg p-3 mb-4 text-center">
              <p className="text-xs text-muted-foreground">Demo: Your verification code is</p>
              <p className="text-2xl font-bold text-primary tracking-[0.3em] mt-1">{generatedCode}</p>
            </div>

            {verifyError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 mb-4">{verifyError}</div>
            )}

            <div className="mb-4">
              <Label className="text-card-foreground text-xs">Enter Verification Code</Label>
              <Input
                type="text"
                maxLength={6}
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ""))}
                className="mt-1 text-center text-xl tracking-[0.3em] font-bold"
                placeholder="000000"
              />
            </div>

            <Button onClick={handleVerify} className="w-full" disabled={loading || enteredCode.length !== 6}>
              {loading ? "Verifying..." : "Verify & Create Account"}
            </Button>

            <div className="flex items-center justify-between mt-4">
              <button onClick={() => setStep("form")} className="text-sm text-muted-foreground hover:text-card-foreground">
                ← Back
              </button>
              <button onClick={handleResendCode} className="text-sm text-primary font-medium hover:underline">
                Resend Code
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-primary px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <img src={svbLogo} alt="SVB" width={56} height={56} className="mb-2" />
          <h1 className="text-xl font-bold text-primary-foreground">Create Account</h1>
        </div>

        <div className="bg-card rounded-2xl shadow-elevated p-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 mb-4">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-card-foreground text-xs">First Name</Label>
                <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-card-foreground text-xs">Last Name</Label>
                <Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-card-foreground text-xs">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-card-foreground text-xs">Password</Label>
              <div className="relative mt-1">
                <Input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-card-foreground text-xs">Confirm Password</Label>
              <Input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-card-foreground text-xs">Country</Label>
                <select value={form.country} onChange={(e) => update("country", e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-card-foreground text-xs">Language</Label>
                <select value={form.language} onChange={(e) => update("language", e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select</option>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <Label className="text-card-foreground text-xs">CAPTCHA: What is {captcha.question}?</Label>
              <Input type="number" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} className="mt-1" placeholder="Your answer" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : <><UserPlus size={18} className="mr-2" /> Create Account</>}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
