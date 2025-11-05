import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/services/api"; // Importar api
import { toast } from "sonner"; // Importar toast
import { User, updateProfile } from "firebase/auth"; // Importar updateProfile
import { auth } from "@/lib/firebase"; // Importar auth

interface CompleteProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CompleteProfileDialog = ({
  open,
  onOpenChange,
}: CompleteProfileDialogProps) => {
  const { user, setUser, setIsLeader, setCompleteProfileOpen } = useAuth();
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Só executa se o dialog estiver aberto e o usuário existir
    if (user && open) {
      // --- ESTA É A CORREÇÃO ---
      // 1. Tenta usar o displayName do Firebase Auth
      if (user.displayName) {
        setFullName(user.displayName);
      }
      // 2. Se não tiver, TENTA usar o email (e verifica se ele existe)
      else if (user.email) {
        setFullName(user.email.split("@")[0]); // Esta era a linha 28
      }
      // 3. Se não tiver nenhum, usa string vazia
      else {
        setFullName("");
      }
      // --- FIM DA CORREÇÃO ---
    }
  }, [user, open]); // Depende de 'open' para rodar QUANDO o dialog abrir

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fullName.trim()) {
      toast.error("O nome completo é obrigatório.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Criar o documento 'leader' no Firestore
      const leaderData = {
        uid: user.uid,
        full_name: fullName.trim(),
        email: user.email || "", // Garante que email é string
        photo_url: user.photoURL || "",
      };

      await api.createLeader(leaderData);

      // 2. (Opcional mas recomendado) Atualiza o perfil do Firebase Auth
      // Isso salva o nome no próprio Firebase, útil para futuros logins
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: fullName.trim(),
        });
      }

      // 3. Atualizar o estado local do AuthContext
      setIsLeader(true);
      setCompleteProfileOpen(false); // Fecha o dialog

      // 4. Atualiza o objeto 'user' no contexto (opcional, mas bom)
      setUser(auth.currentUser);

      toast.success("Perfil de líder criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar perfil de líder:", error);
      toast.error("Falha ao salvar o perfil. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Completar Perfil de Líder</DialogTitle>
            <DialogDescription>
              Parece que é sua primeira vez aqui. Precisamos do seu nome completo
              para criar seu perfil de líder.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={user?.email || "N/A"}
                disabled
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome Completo
              </Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="col-span-3"
                placeholder="Seu nome completo"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Salvar e Continuar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};