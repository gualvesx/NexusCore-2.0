import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CompleteProfileDialog } from "@/components/CompleteProfileDialog";
import { auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [incompleteProfileData, setIncompleteProfileData] = useState<{
    userId: string;
    email: string;
    fullName: string;
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpf: "",
    birthDate: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.login(loginData);
      toast({
        title: t('login.loginSuccess'),
        description: t('login.loginSuccessDescription'),
      });
      // Don't navigate here - useEffect will handle it after auth state updates
    } catch (error: any) {
      toast({
        title: t('login.loginError'),
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: t('common.error'),
        description: t('login.passwordMismatch'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        fullName: registerData.fullName,
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        cpf: registerData.cpf,
        birthDate: registerData.birthDate,
      });
      
      toast({
        title: t('login.accountCreated'),
        description: 'Verifique seu email para confirmar o cadastro antes de fazer login.',
      });
      setIsLogin(true); // Volta para tela de login
      setIsLoading(false);
    } catch (error: any) {
      toast({
        title: t('login.createAccountError'),
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await authService.loginWithGoogle();
      
      // Verificar se o perfil está completo
      const currentUser = auth.currentUser;
      if (currentUser) {
        const docRef = doc(db, "leaders", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists() || !docSnap.data().cpf || !docSnap.data().birthDate) {
          // Perfil incompleto, mostrar dialog
          setIncompleteProfileData({
            userId: currentUser.uid,
            email: currentUser.email || '',
            fullName: currentUser.displayName || ''
          });
          setShowCompleteProfile(true);
          setIsLoading(false);
        } else {
          toast({
            title: t('login.loginSuccess'),
            description: t('login.loginSuccessDescription'),
          });
        }
      }
    } catch (error: any) {
      toast({
        title: t('login.loginError'),
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleProfileComplete = async () => {
    setShowCompleteProfile(false);
    setIncompleteProfileData(null);
    await refreshUser();
    toast({
      title: t('login.loginSuccess'),
      description: t('login.loginSuccessDescription'),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <LanguageSelector />
        <ThemeToggle />
      </div>
      
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md border-border shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-between items-start mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="hover:bg-primary/10"
            >
              ← Voltar
            </Button>
            <div className="flex-1 flex justify-center">
              <img
                src="/LOGO.png"
                alt="NexusCore Security Logo"
                className="w-20 h-20 rounded-xl shadow-lg"
              />
            </div>
            <div className="w-20" /> {/* Spacer for balance */}
          </div>
          <CardTitle className="text-2xl">
            {isLogin ? t('login.title') : t('login.createAccountTitle')}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? t('login.description')
              : t('login.createAccountDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('common.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('login.entering')}
                  </>
                ) : (
                  t('login.enterButton')
                )}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('common.fullName')}</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={t('common.fullName')}
                  value={registerData.fullName}
                  onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg_username">{t('common.username')}</Label>
                <Input
                  id="reg_username"
                  type="text"
                  placeholder="seu.usuario"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={registerData.cpf}
                  onChange={(e) => setRegisterData({ ...registerData, cpf: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={registerData.birthDate}
                  onChange={(e) => setRegisterData({ ...registerData, birthDate: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg_password">{t('common.password')}</Label>
                <Input
                  id="reg_password"
                  type="password"
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">{t('common.confirmPassword')}</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('login.creatingAccount')}
                  </>
                ) : (
                  t('common.createAccount')
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
              disabled={isLoading}
            >
              {isLogin ? t('common.noAccount') : t('common.alreadyHaveAccount')}
            </button>
          </div>
        </CardContent>
      </Card>

      {incompleteProfileData && (
        <CompleteProfileDialog
          open={showCompleteProfile}
          userId={incompleteProfileData.userId}
          email={incompleteProfileData.email}
          fullName={incompleteProfileData.fullName}
          onComplete={handleProfileComplete}
        />
      )}
    </div>
  );
};

export default Login;
