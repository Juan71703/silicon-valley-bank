import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, User, Globe, Lock, Bell, LogOut, ChevronRight, X, Eye, EyeOff, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type SettingsPanel = null | "personal" | "language" | "security" | "notifications";

const SettingsPage = () => {
  const { user, logout, updateUser, updateAvatar, updatePassword, setTransactionPin } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<SettingsPanel>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Personal info state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Security state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setPhone(user.phone || "");
    }
  }, [user, activePanel]);

  if (!user) return null;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) { toast.error("Only JPEG and PNG allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => updateAvatar(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSavePersonal = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error(t("contact.fillAll")); return;
    }
    updateUser({ firstName, lastName, email, phone });
    toast.success(t("settings.saved"));
    setActivePanel(null);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) { toast.error(t("contact.fillAll")); return; }
    if (newPassword !== confirmPassword) { toast.error(t("settings.passwordMismatch")); return; }
    if (newPassword.length < 8) { toast.error(t("settings.passwordTooShort")); return; }
    const success = await updatePassword(oldPassword, newPassword);
    if (success) {
      toast.success(t("settings.passwordChanged"));
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } else {
      toast.error(t("settings.wrongPassword"));
    }
  };

  const handleSetPin = () => {
    if (pinValue.length !== 4) { toast.error(t("settings.pinLength")); return; }
    if (pinValue !== confirmPin) { toast.error(t("settings.pinMismatch")); return; }
    setTransactionPin(pinValue);
    toast.success(t("settings.pinSet"));
    setPinValue(""); setConfirmPin("");
  };

  const items = [
    { key: "personal" as const, icon: User, label: t("settings.personalInfo"), sub: t("settings.personalSub") },
    { key: "language" as const, icon: Globe, label: t("settings.langRegion"), sub: `${user.language} · ${user.country}` },
    { key: "security" as const, icon: Lock, label: t("settings.security"), sub: t("settings.securitySub") },
    { key: "notifications" as const, icon: Bell, label: t("settings.notifications"), sub: t("settings.notificationsSub") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 flex items-center gap-3 text-primary-foreground">
        <button onClick={() => activePanel ? setActivePanel(null) : navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="font-bold text-lg">{activePanel ? items.find(i => i.key === activePanel)?.label || t("page.settings") : t("page.settings")}</h1>
      </header>

      <div className="px-4 py-6 animate-fade-in">
        {!activePanel && (
          <>
            {/* Profile avatar */}
            <div className="flex flex-col items-center mb-6">
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleAvatarUpload} />
              <button onClick={() => fileInputRef.current?.click()} className="relative group mb-2">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    {user.firstName[0]}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Plus size={14} className="text-primary-foreground" />
                </div>
              </button>
              <p className="font-bold text-card-foreground">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <button key={item.key} onClick={() => setActivePanel(item.key)}
                  className="w-full bg-card rounded-xl shadow-card p-4 flex items-center gap-3 hover:shadow-elevated transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><item.icon size={18} className="text-primary" /></div>
                  <div className="flex-1 text-left"><p className="text-sm font-medium text-card-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.sub}</p></div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
              <button onClick={async () => { await logout(); navigate("/login"); }} className="w-full bg-destructive/10 rounded-xl p-4 flex items-center gap-3 mt-4">
                <LogOut size={18} className="text-destructive" />
                <span className="text-sm font-medium text-destructive">{t("settings.signOut")}</span>
              </button>
            </div>
          </>
        )}

        {/* Personal Information Panel */}
        {activePanel === "personal" && (
          <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
            <div className="flex flex-col items-center mb-4">
              <button onClick={() => fileInputRef.current?.click()} className="relative group mb-3">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-3xl font-bold">{user.firstName[0]}</div>
                )}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  <Plus size={16} className="text-primary-foreground" />
                </div>
              </button>
            </div>
            <div>
              <Label className="text-card-foreground text-xs">{t("settings.firstName")}</Label>
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-card-foreground text-xs">{t("settings.lastName")}</Label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-card-foreground text-xs">{t("account.email")}</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-card-foreground text-xs">{t("settings.phone")}</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" placeholder="+1 (555) 000-0000" />
            </div>
            <Button onClick={handleSavePersonal} className="w-full">{t("settings.saveChanges")}</Button>
          </div>
        )}

        {/* Language & Region Panel */}
        {activePanel === "language" && (
          <div className="bg-card rounded-2xl shadow-card p-5 space-y-3">
            <p className="text-sm text-muted-foreground mb-2">{t("settings.selectLanguage")}</p>
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => { setLang(l.code); toast.success(`${t("settings.langChanged")} ${l.label}`); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${lang === l.code ? "bg-primary/10 border border-primary/30" : "bg-muted hover:bg-muted/70"}`}>
                <span className={`text-sm font-medium ${lang === l.code ? "text-primary" : "text-card-foreground"}`}>{l.label}</span>
                {lang === l.code && <Check size={18} className="text-primary" />}
              </button>
            ))}
          </div>
        )}

        {/* Security Panel */}
        {activePanel === "security" && (
          <div className="space-y-4">
            {/* Change Password */}
            <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
              <h3 className="font-bold text-card-foreground">{t("settings.changePassword")}</h3>
              <div>
                <Label className="text-card-foreground text-xs">{t("settings.oldPassword")}</Label>
                <div className="relative mt-1">
                  <Input type={showOldPw ? "text" : "password"} value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowOldPw(!showOldPw)}>
                    {showOldPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-card-foreground text-xs">{t("settings.newPassword")}</Label>
                <div className="relative mt-1">
                  <Input type={showNewPw ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNewPw(!showNewPw)}>
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-card-foreground text-xs">{t("settings.confirmNewPassword")}</Label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1" />
              </div>
              <Button onClick={handleChangePassword} className="w-full">{t("settings.updatePassword")}</Button>
            </div>

            {/* Transaction PIN */}
            <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
              <h3 className="font-bold text-card-foreground">{t("settings.transactionPin")}</h3>
              <p className="text-xs text-muted-foreground">{user.pin ? t("settings.pinExists") : t("settings.createPin")}</p>
              <div>
                <Label className="text-card-foreground text-xs">{t("settings.enterPin")}</Label>
                <Input type="password" maxLength={4} value={pinValue} onChange={e => setPinValue(e.target.value.replace(/\D/g, "").slice(0, 4))} className="mt-1 text-center text-lg tracking-widest" placeholder="••••" />
              </div>
              <div>
                <Label className="text-card-foreground text-xs">{t("settings.confirmPin")}</Label>
                <Input type="password" maxLength={4} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))} className="mt-1 text-center text-lg tracking-widest" placeholder="••••" />
              </div>
              <Button onClick={handleSetPin} className="w-full">{user.pin ? t("settings.updatePin") : t("settings.setPin")}</Button>
            </div>
          </div>
        )}

        {/* Notifications Panel */}
        {activePanel === "notifications" && (
          <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
            <h3 className="font-bold text-card-foreground">{t("settings.contactDetails")}</h3>
            <div className="bg-muted rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">{t("account.email")}</span>
                <span className="text-sm font-medium text-card-foreground">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">{t("settings.phone")}</span>
                <span className="text-sm font-medium text-card-foreground">{user.phone || t("settings.notSet")}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{t("settings.notifDesc")}</p>
          </div>
        )}
      </div>
      <footer className="text-center text-xs text-muted-foreground py-4">{t("footer.copyright")}</footer>
    </div>
  );
};

export default SettingsPage;
