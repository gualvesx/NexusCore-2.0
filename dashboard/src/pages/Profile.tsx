import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";

const Profile = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.updateProfile(fullName);
      await refreshUser();
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate("/dashboard")} 
                variant="ghost" 
                size="icon"
                className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img
                src="/LOGO.png"
                alt="NexusCore Security Logo"
                className="w-10 h-10 rounded-lg shadow-lg"
              />
              <h1 className="text-2xl font-bold">Meu Perfil</h1>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <ThemeToggle />
              <Button 
                onClick={() => navigate("/dashboard")} 
                variant="outline"
                className="hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
              >
                Voltar ao Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-2xl">
        {/* Profile Information */}
        <Card className="mb-6 border-border hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>Atualize suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  value={user?.username || ""}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">O nome de usuário não pode ser alterado</p>
              </div>
              <Button 
                type="submit" 
                variant="gradient"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Reset Notice */}
        <Card className="border-border hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Redefinir Senha</CardTitle>
            <CardDescription>Para alterar sua senha, use a opção "Esqueceu a senha?" na tela de login</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Por segurança, a redefinição de senha é feita exclusivamente através do Firebase Authentication.
            </p>
            <Button 
              variant="outline"
              onClick={() => navigate("/login")}
            >
              Ir para o Login
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
