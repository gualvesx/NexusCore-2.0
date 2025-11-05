import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CookiePreferencesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CookiePreferences({ open, onOpenChange }: CookiePreferencesProps) {
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem("cookie-preferences");
    return saved ? JSON.parse(saved) : {
      necessary: true,
      analytics: false,
      marketing: false,
    };
  });

  const savePreferences = () => {
    localStorage.setItem("cookie-preferences", JSON.stringify(preferences));
    localStorage.setItem("cookie-consent", "customized");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-arvo">Preferências de Cookies</DialogTitle>
          <DialogDescription>
            Gerencie suas preferências de cookies. Cookies necessários não podem ser desativados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex-1">
              <Label htmlFor="necessary" className="font-medium">Necessários</Label>
              <p className="text-sm text-muted-foreground">
                Essenciais para o funcionamento do site
              </p>
            </div>
            <Switch
              id="necessary"
              checked={true}
              disabled
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex-1">
              <Label htmlFor="analytics" className="font-medium">Análise</Label>
              <p className="text-sm text-muted-foreground">
                Nos ajudam a melhorar o site
              </p>
            </div>
            <Switch
              id="analytics"
              checked={preferences.analytics}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, analytics: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex-1">
              <Label htmlFor="marketing" className="font-medium">Marketing</Label>
              <p className="text-sm text-muted-foreground">
                Personalizam sua experiência
              </p>
            </div>
            <Switch
              id="marketing"
              checked={preferences.marketing}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, marketing: checked })
              }
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={savePreferences}>
            Salvar Preferências
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
