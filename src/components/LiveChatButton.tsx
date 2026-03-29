import { MessageCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

const LiveChatButton = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-live-chat", handler);
    return () => window.removeEventListener("open-live-chat", handler);
  }, []);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 w-80 bg-card rounded-2xl shadow-elevated border border-border animate-fade-in overflow-hidden">
          <div className="gradient-primary p-4 flex items-center justify-between text-primary-foreground">
            <div>
              <p className="font-bold text-sm">Live Chat</p>
              <p className="text-xs opacity-80">We typically reply in a few minutes</p>
            </div>
            <button onClick={() => setOpen(false)}><X size={18} /></button>
          </div>
          <div className="p-4 h-48 flex items-center justify-center">
            <p className="text-sm text-muted-foreground text-center">
              👋 Hi there! How can we help you today? Type your message below.
            </p>
          </div>
          <div className="p-3 border-t border-border">
            <input
              placeholder="Type a message..."
              className="w-full bg-muted rounded-full px-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      )}
      <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2">
        {!open && (
          <div className="bg-card shadow-elevated rounded-full px-3 py-2 border border-border animate-fade-in">
            <p className="text-xs font-medium text-card-foreground whitespace-nowrap">How may we help you?</p>
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full gradient-primary shadow-elevated flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform"
        >
          {open ? <X size={22} /> : <MessageCircle size={22} />}
        </button>
      </div>
    </>
  );
};

export default LiveChatButton;
