import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const TAWK_SRC = "https://embed.tawk.to/69d3c8187b03a71c369e7f52/1jlhkb83m";

const TawkToWidget = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      // Hide widget if it exists
      if ((window as any).Tawk_API?.hideWidget) {
        (window as any).Tawk_API.hideWidget();
      }
      return;
    }

    // If already loaded, just show it
    if ((window as any).Tawk_API?.showWidget) {
      (window as any).Tawk_API.showWidget();
      return;
    }

    // Load Tawk.to script dynamically
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();

    // Customize: move button up and set blue color
    (window as any).Tawk_API.customStyle = {
      visibility: {
        desktop: { position: "br", xOffset: 20, yOffset: 80 },
        mobile: { position: "br", xOffset: 10, yOffset: 80 },
      },
    };

    (window as any).Tawk_API.onLoad = function () {
      // Inject custom CSS to make the widget blue
      const style = document.createElement("style");
      style.textContent = `
        iframe[title="chat widget"] + div,
        .tawk-min-container .tawk-button {
          background-color: #2563eb !important;
        }
      `;
      document.head.appendChild(style);
    };

    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = TAWK_SRC;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    s1.id = "tawk-script";
    document.body.appendChild(s1);

    return () => {
      // Cleanup on unmount
      if ((window as any).Tawk_API?.hideWidget) {
        (window as any).Tawk_API.hideWidget();
      }
    };
  }, [isAuthenticated]);

  return null;
};

export default TawkToWidget;
