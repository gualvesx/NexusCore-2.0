import { Shield, Activity, Users, AlertTriangle, Settings } from "lucide-react";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { ChartSection } from "@/components/Dashboard/ChartSection";
import { ActivityLog } from "@/components/Dashboard/ActivityLog";
import { UserSummary } from "@/components/Dashboard/UserSummary";
import { Filters } from "@/components/Dashboard/Filters";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";
import { FilterProvider } from "@/contexts/FilterContext";
import { useMemo } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboardData();
  const { logout, user } = useAuth();

  const stats = useMemo(() => {
    if (!data) return { totalUsers: 0, totalAlerts: 0, aiDetections: 0, totalLogs: 0 };

    const uniqueUsers = new Set(data.summary.map(u => u.student_db_id)).size;
    const alertLogs = data.logs.filter(log => 
      log.categoria === "IA" || log.categoria === "Rede Social"
    ).length;
    const aiLogs = data.logs.filter(log => log.categoria === "IA").length;

    return {
      totalUsers: uniqueUsers,
      totalAlerts: alertLogs,
      aiDetections: aiLogs,
      totalLogs: data.logs.length,
    };
  }, [data]);

  return (
    <FilterProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                <img
                  src="/LOGO.png"
                  alt="NexusCore Security Logo"
                  className="w-10 h-10 rounded-lg shadow-lg hover:scale-110 transition-transform duration-300"
                />
                <div>
                  <h1 className="text-xl font-bold hover:text-primary transition-colors">NexusCore Security</h1>
                  <p className="text-xs text-muted-foreground -mt-1">Real-time Protection</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Bem-vindo, {user?.full_name || 'Professor'}</span>
                <LanguageSelector />
                <ThemeToggle />
                <Button 
                  onClick={() => navigate("/profile")} // CORREÇÃO AQUI: Mudado de /perfil para /profile
                  variant="ghost" 
                  className="gap-2"
                >
                  Perfil
                </Button>
                <Button 
                  onClick={() => navigate("/management")} // Verifica se a rota no App.tsx é /management ou /gerenciamento. No seu App.tsx é /management.
                  variant="outline" 
                  className="gap-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                >
                  <Settings className="w-4 h-4" />
                  Gerenciar
                </Button>
                <Button 
                  variant="destructive" 
                  className="hover:scale-105 transition-transform duration-300"
                  onClick={logout}
                >
                  SAIR
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            <StatsCard
              title="Total de Usuários"
              value={isLoading ? "..." : stats.totalUsers.toString()}
              icon={Users}
              trend=""
              variant="default"
            />
            <StatsCard
              title="Alertas Ativos"
              value={isLoading ? "..." : stats.totalAlerts.toString()}
              icon={AlertTriangle}
              trend=""
              variant="warning"
            />
            <StatsCard
              title="Uso de IA"
              value={isLoading ? "..." : stats.aiDetections.toString()}
              icon={Shield}
              trend=""
              variant="success"
            />
            <StatsCard
              title="Atividades Hoje"
              value={isLoading ? "..." : stats.totalLogs.toString()}
              icon={Activity}
              trend=""
              variant="info"
            />
          </div>

          {/* Chart Section */}
          <div className="mb-8 animate-fade-in">
            <ChartSection />
          </div>

          {/* Filters */}
          <div className="mb-8">
            <Filters />
          </div>

          {/* Activity Log */}
          <div className="mb-8">
            <ActivityLog />
          </div>

          {/* User Summary */}
          <div>
            <UserSummary />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card/30 backdrop-blur-sm mt-12">
          <div className="container mx-auto px-6 py-6 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <img
                src="/LOGO.png"
                alt="NexusCore Security Logo"
                className="w-6 h-6 rounded shadow-md"
              />
              <span>© 2025 NexusCore Security - Sistema de Monitoramento de Acesso. Todos os direitos reservados.</span>
            </div>
          </div>
        </footer>
      </div>
    </FilterProvider>
  );
};

export default Index;