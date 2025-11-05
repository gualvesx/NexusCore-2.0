import { Shield, Activity, Users, AlertTriangle, Eye, BarChart3 } from "lucide-react";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PublicDashboard = () => {
  const navigate = useNavigate();

  // Dados mockados para demonstração
  const mockStats = {
    totalUsers: 156,
    totalAlerts: 23,
    aiDetections: 47,
    totalLogs: 1284,
  };

  const mockRecentActivity = [
    { id: 1, user: "João Silva", site: "facebook.com", category: "Rede Social", time: "14:32", status: "blocked" },
    { id: 2, user: "Maria Santos", site: "youtube.com", category: "Streaming", time: "14:28", status: "alert" },
    { id: 3, user: "Pedro Costa", site: "chatgpt.com", category: "IA", time: "14:25", status: "ai" },
    { id: 4, user: "Ana Oliveira", site: "linkedin.com", category: "Profissional", time: "14:20", status: "allowed" },
    { id: 5, user: "Carlos Souza", site: "instagram.com", category: "Rede Social", time: "14:15", status: "blocked" },
  ];

  const mockTopSites = [
    { site: "google.com", visits: 234, category: "Busca" },
    { site: "chatgpt.com", visits: 189, category: "IA" },
    { site: "youtube.com", visits: 156, category: "Streaming" },
    { site: "facebook.com", visits: 98, category: "Rede Social" },
    { site: "linkedin.com", visits: 76, category: "Profissional" },
  ];

  return (
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
                <p className="text-xs text-muted-foreground -mt-1">Dashboard de Demonstração</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate("/")} 
                variant="ghost"
              >
                Voltar
              </Button>
              <Button 
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                Fazer Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Demo Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Modo Demonstração</h2>
              <p className="text-muted-foreground">
                Esta é uma visualização pública com dados simulados. Faça login para acessar seus dados reais.
              </p>
            </div>
            <Button 
              onClick={() => navigate("/cadastro")}
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Criar Conta Grátis
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <StatsCard
            title="Total de Usuários"
            value={mockStats.totalUsers.toString()}
            icon={Users}
            trend="+12% vs. mês anterior"
            variant="default"
          />
          <StatsCard
            title="Alertas Ativos"
            value={mockStats.totalAlerts.toString()}
            icon={AlertTriangle}
            trend="-8% vs. mês anterior"
            variant="warning"
          />
          <StatsCard
            title="Detecções de IA"
            value={mockStats.aiDetections.toString()}
            icon={Shield}
            trend="+23% vs. mês anterior"
            variant="success"
          />
          <StatsCard
            title="Atividades Hoje"
            value={mockStats.totalLogs.toString()}
            icon={Activity}
            trend="+5% vs. ontem"
            variant="info"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRecentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.site}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          activity.status === "blocked"
                            ? "bg-red-500/10 text-red-600"
                            : activity.status === "alert"
                            ? "bg-amber-500/10 text-amber-600"
                            : activity.status === "ai"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-green-500/10 text-green-600"
                        }`}
                      >
                        {activity.category}
                      </span>
                      <span className="text-xs text-muted-foreground min-w-[40px]">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Sites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Sites Mais Acessados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTopSites.map((site, index) => (
                  <div key={site.site} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{site.site}</p>
                          <p className="text-xs text-muted-foreground">{site.category}</p>
                        </div>
                      </div>
                      <span className="font-bold">{site.visits}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                        style={{ width: `${(site.visits / 234) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Pronto para Começar?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Crie sua conta gratuitamente e comece a monitorar acessos em tempo real. 
              Sem compromisso, cancele quando quiser.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate("/cadastro")}
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary"
              >
                Criar Conta Grátis
              </Button>
              <Button
                onClick={() => navigate("/precos")}
                size="lg"
                variant="outline"
              >
                Ver Planos
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PublicDashboard;
