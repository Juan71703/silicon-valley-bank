import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";

const Contact = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) { toast.error("Please fill all fields"); return; }
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 flex items-center gap-3 text-primary-foreground">
        <button onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="font-bold text-lg">Contact Support</h1>
      </header>
      <div className="px-4 py-6 space-y-4 animate-fade-in">
        <div className="bg-card rounded-2xl shadow-card p-5 space-y-3">
          <div className="flex items-center gap-3"><Mail size={18} className="text-primary" /><span className="text-sm text-card-foreground">support@svb.com</span></div>
          <div className="flex items-center gap-3"><Phone size={18} className="text-primary" /><span className="text-sm text-card-foreground">+1 (800) 555-0199</span></div>
          <div className="flex items-center gap-3"><MapPin size={18} className="text-primary" /><span className="text-sm text-card-foreground">3003 Tasman Dr, Santa Clara, CA</span></div>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h2 className="font-bold text-card-foreground mb-3">Send us a message</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><Label className="text-card-foreground text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-card-foreground text-xs">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-card-foreground text-xs">Message</Label><Textarea value={form.message} onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))} className="mt-1" rows={4} /></div>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        </div>
      </div>
      <footer className="text-center text-xs text-muted-foreground py-4">© 2026 Silicon Valley Bank. All Rights Reserved.</footer>
    </div>
  );
};

export default Contact;
