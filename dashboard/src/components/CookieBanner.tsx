import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CookiePreferences } from "./CookiePreferences";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-preferences", JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
    }));
    setShowBanner(false);
  };

  const rejectAll = () => {
    localStorage.setItem("cookie-consent", "rejected");
    localStorage.setItem("cookie-preferences", JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
    }));
    setShowBanner(false);
  };

  return (
    <>
      {/* Cookie Settings Button - Always visible bottom left */}
      <button
        onClick={() => setShowPreferences(true)}
        className="fixed bottom-4 left-4 z-[60] p-3 bg-card border border-border rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group"
        title="Gerenciar Cookies"
        aria-label="Gerenciar Cookies"
      >
        <i className="fas fa-cog w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:rotate-90 duration-300" />
      </button>

      {/* Compact Banner */}
      {showBanner && (
        <div className="fixed bottom-20 left-4 z-[70] max-w-sm bg-card/95 backdrop-blur-sm border border-border shadow-xl rounded-lg animate-fade-in">
          <div className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <i className="fas fa-cookie-bite text-primary flex-shrink-0 mt-0.5 text-lg" />
              <div>
                <h3 className="font-arvo font-semibold text-sm mb-1">Cookies</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Usamos cookies para melhorar sua experiência.{" "}
                  <button 
                    onClick={() => setShowPreferences(true)}
                    className="text-primary hover:underline font-medium"
                  >
                    Personalizar
                  </button>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={rejectAll} 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs h-8"
              >
                Rejeitar
              </Button>
              <Button 
                onClick={acceptAll} 
                size="sm" 
                className="flex-1 text-xs h-8"
              >
                Aceitar
              </Button>
            </div>
          </div>
        </div>
      )}

      <CookiePreferences open={showPreferences} onOpenChange={setShowPreferences} />
    </>
  );
}
