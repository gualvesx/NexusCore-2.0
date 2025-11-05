import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CookieBanner } from "@/components/CookieBanner";
import { PricingDialog } from "@/components/PricingDialog";
import { useEffect, useState, useRef } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { cn } from "@/lib/utils";

const Landing = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const { data } = useDashboardData();
  const stats = data ? { totalUsers: data.summary.length, totalAlerts: 0, aiDetections: 0 } : null;

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 5);
    }, 5000);

    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      const navHeight = navRef.current?.offsetHeight || 80;

      if (typeof window !== 'undefined') {
        if (currentScrollY > lastScrollY && currentScrollY > navHeight) {
          setShowHeader(false);
        } else {
          setShowHeader(true);
        }
        setLastScrollY(currentScrollY);
      }
    };

    const observerCallback = (entries: IntersectionObserverEntry[], observerInstance: IntersectionObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-enter-active');
          observerInstance.unobserve(entry.target);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elementsToAnimate = document.querySelectorAll('[data-animate-on-scroll]');
    elementsToAnimate.forEach(el => observer.observe(el));

    window.addEventListener('scroll', controlNavbar);

    return () => {
      window.removeEventListener('scroll', controlNavbar);
      clearInterval(interval);
      elementsToAnimate.forEach(el => observer.unobserve(el));
    };
  }, [lastScrollY]);

  const features = [
    {
      icon: "fa-solid fa-eye",
      title: "Monitoramento em Tempo Real",
      description: "Acompanhe todos os sites acessados pelos usuários com atualizações instantâneas",
      details: [
        "Registro completo de URLs visitadas",
        "Histórico detalhado de navegação por usuário",
        "Filtros por data, horário e categoria de site",
        "Visualização de acessos ativos em tempo real"
      ],
      metric: "< 100ms",
      metricLabel: "Tempo de detecção",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10"
    },
    {
      icon: "fa-solid fa-triangle-exclamation",
      title: "Alertas de Sites Indevidos",
      description: "Notificações automáticas quando usuários acessam sites bloqueados ou suspeitos",
      details: [
        "Detecção instantânea de sites não permitidos",
        "Alertas por email, SMS e dashboard",
        "Categorização automática de sites (redes sociais, jogos, adulto)",
        "Regras personalizadas por departamento ou usuário"
      ],
      metric: "98.5%",
      metricLabel: "Taxa de detecção",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-500/10 to-orange-500/10"
    },
    {
      icon: "fa-solid fa-chart-column",
      title: "Dashboard Analítico",
      description: "Visualize padrões de navegação através de gráficos e relatórios detalhados",
      details: [
        "Gráficos de sites mais acessados",
        "Análise de produtividade por usuário",
        "Comparativos entre períodos",
        "Identificação de tendências de acesso"
      ],
      metric: "50+",
      metricLabel: "Tipos de relatórios",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/10"
    },
    {
      icon: "fa-solid fa-users",
      title: "Gestão de Usuários",
      description: "Monitore individualmente ou em grupos com diferentes políticas de acesso",
      details: [
        "Perfis de monitoramento personalizados",
        "Grupos por departamento ou função",
        "Políticas de acesso diferenciadas",
        "Histórico individual de navegação"
      ],
      metric: "10k+",
      metricLabel: "Usuários monitorados",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-500/10 to-emerald-500/10"
    },
    {
      icon: "fa-solid fa-file-lines",
      title: "Relatórios de Navegação",
      description: "Exporte dados de acesso filtrados por período, usuário ou categoria",
      details: [
        "Relatórios de conformidade e produtividade",
        "Exportação em PDF, Excel e CSV",
        "Agendamento automático de relatórios",
        "Análise de sites mais visitados"
      ],
      metric: "100+",
      metricLabel: "Templates de relatório",
      gradient: "from-red-500 to-rose-500",
      bgGradient: "from-red-500/10 to-rose-500/10"
    }
  ];

  const animateProps = (delay: number = 0) => ({
      'data-animate-on-scroll': true,
      style: { transitionDelay: `${delay}ms` }
  });


  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden"> {/* Adicionado overflow-x-hidden para evitar scroll horizontal indesejado */}
      {/* Backgrounds - REVISADO PARA GRADIENTES MAIS FLUIDOS */}
       <div className="fixed inset-0 -z-20">
            {/* Gradiente principal animado, agora um pouco mais suave */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 bg-400% animate-background-pan" />

            {/* Pontos de luz/gradiente radiais espalhados */}
            <div className="absolute top-[10%] left-[15%] w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-[50%] right-[10%] w-80 h-80 bg-secondary/8 rounded-full blur-3xl animate-pulse delay-700" />
            <div className="absolute bottom-[20%] left-[5%] w-72 h-72 bg-accent/8 rounded-full blur-3xl animate-pulse delay-1400" />
            <div className="absolute top-[30%] right-[30%] w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse delay-2100" />
            <div className="absolute bottom-[10%] right-[25%] w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-2800" />
        </div>
      <div data-vw="true" className="enabled"> {/* Vlibras */}
          <div data-vw-access-button="true" className="active"></div>
          <div data-vw-plugin-wrapper="true"><div className="vw-plugin-top-wrapper"></div></div>
      </div>
      <div className="fixed inset-0 -z-10">
          {/* Este overlay bg-background/90 é importante para clarear os gradientes de fundo sem escondê-los totalmente */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/90" />
          {/* A grade de pontos agora está mais sutil */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8881_1px,transparent_1px),linear-gradient(to_bottom,#8881_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <PricingDialog open={pricingDialogOpen} onOpenChange={setPricingDialogOpen} />

      {/* Navigation - Borda mais suave */}
      <nav
          ref={navRef}
          className={cn(
              'bg-background/80 backdrop-blur-xl border-b border-border/30 sticky top-0 z-50 transition-transform duration-300 ease-in-out', /* border-border/30 para suavizar */
              showHeader ? 'translate-y-0' : '-translate-y-full'
          )}
      >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-12">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
                    <img
                    src="/LOGO.png"
                    alt="NexusCore Security Logo"
                    className="w-12 h-12 rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                    />
                    <div className="flex flex-col">
                    <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        NexusCore
                    </span>
                    <span className="text-xs text-muted-foreground -mt-1">Real-time Protection</span>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-8">
                    <a
                        href="#home"
                        className="text-foreground/80 hover:text-primary transition-all duration-300 font-medium relative group"
                    >
                        Home
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
                    </a>
                    <a
                        href="/precos"
                        className="text-foreground/80 hover:text-primary transition-all duration-300 font-medium relative group"
                    >
                        Preços
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
                    </a>
                    <a
                        href="/contato"
                        className="text-foreground/80 hover:text-primary transition-all duration-300 font-medium relative group"
                    >
                        Contato
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
                    </a>
                </div>
                </div>

                <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button
                    onClick={() => navigate("/dashboard")}
                    className="relative rounded-xl px-6 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden bg-gradient-to-r from-primary to-secondary"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    <i className="fa-solid fa-bolt mr-2 relative z-10 group-hover:rotate-12 transition-transform" />
                    <span className="relative z-10">Acessar Dashboard</span>
                </Button>
                </div>
            </div>
            </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Text Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div {...animateProps(0)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  <i className="fa-solid fa-sparkles" />
                  Monitoramento Inteligente de Navegação Web
                </div>
                <h1 {...animateProps(100)} className="text-5xl lg:text-7xl font-bold leading-tight">
                  Monitore Acessos{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                      Web em Tempo Real
                    </span>
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary blur-2xl opacity-20 -z-10" />
                  </span>
                </h1>
                <p {...animateProps(200)} className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Solução completa para empresas e escolas monitorarem sites acessados,
                  detectarem conteúdo indevido e garantirem produtividade através de alertas inteligentes.
                </p>
              </div>
              <div {...animateProps(300)} className="flex flex-col sm:flex-row gap-4">
                 <Button
                  onClick={() => navigate("/dashboard")}
                  className="relative rounded-xl px-8 py-6 text-lg shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden bg-gradient-to-r from-primary to-secondary"
                  size="lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <i className="fa-solid fa-chart-line mr-2 relative z-10 group-hover:scale-110 transition-transform" />
                  <span className="relative z-10">Acessar a Demo</span>
                </Button>
                <Button
                  onClick={() => setPricingDialogOpen(true)}
                  variant="outline"
                  className="rounded-xl px-8 py-6 text-lg border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
                  size="lg"
                >
                  <i className="fa-solid fa-file-invoice mr-2 group-hover:rotate-12 transition-transform" />
                  Ver Planos
                </Button>
              </div>
            </div>

            {/* Right Column: Dashboard Mockup + Image */}
            <div {...animateProps(200)} className="relative">
                 {/* Borda do dashboard mockup agora com gradiente mais suave */}
                 <div className="absolute -inset-8 bg-gradient-to-r from-primary/15 to-secondary/15 rounded-3xl blur-3xl animate-pulse" />

              <img
                src="/empresario.png"
                alt="Empresário sorrindo com o dashboard do MonitorPro"
                className="absolute top-34 right-32 w-[1200px] h-auto object-contain z-20
                           lg:w-[2000px] lg:right-64 lg:top-24
                           transform transition-transform duration-300 hover:scale-105"
              />

              {/* Borda do card também mais suave */}
              <div className="relative z-10 bg-card border border-border/30 rounded-2xl p-6 shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                 <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse delay-75" />
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse delay-150" />
                  </div>
                  <div className="text-sm text-muted-foreground ml-2 flex items-center gap-2">
                    <i className="fa-solid fa-circle text-green-500 text-xs animate-pulse" />
                    Monitoramento Ativo
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-3 text-center border border-primary/10 hover:scale-105 transition-transform">
                      <div className="text-lg font-bold text-primary">{stats?.totalUsers || 156}</div>
                      <div className="text-xs text-muted-foreground">Usuários</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-3 text-center border border-amber-500/10 hover:scale-105 transition-transform">
                      <div className="text-lg font-bold text-amber-600">{stats?.totalAlerts || 23}</div>
                      <div className="text-xs text-muted-foreground">Alertas</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg p-3 text-center border border-green-500/10 hover:scale-105 transition-transform">
                      <div className="text-lg font-bold text-green-600">1,284</div>
                      <div className="text-xs text-muted-foreground">Sites/hora</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-muted to-muted/50 rounded-lg h-32 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 animate-gradient bg-[length:200%_auto]" />
                    <i className="fa-solid fa-chart-column text-3xl text-primary group-hover:scale-110 transition-transform relative z-10" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <i className="fa-solid fa-clock" />
                        Sites Acessados Recentemente
                      </span>
                      <span className="text-primary hover:underline cursor-pointer">Ver todos →</span>
                    </div>
                    <div className="space-y-1">
                      {[
                        { site: "facebook.com", status: "Bloqueado", color: "red" },
                        { site: "youtube.com", status: "Alerta", color: "amber" },
                        { site: "linkedin.com", status: "Permitido", color: "green" }
                      ].map((item, index) => (
                        <div
                          key={item.site}
                          className="flex justify-between text-xs p-2 rounded bg-muted/50 hover:bg-muted transition-colors"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <span className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${item.color}-500 animate-pulse`} />
                            {item.site}
                          </span>
                          <span className={`text-${item.color}-600 font-medium`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-32 bg-muted/30 relative overflow-hidden">
        {/* Gradiente de fundo suave para a seção, sem corte brusco */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background/50 pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div {...animateProps()} className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <i className="fa-solid fa-sparkles" />
              Recursos Completos
            </div>
            <h2 className="text-5xl font-bold mb-6">
              Recursos <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">de Monitoramento</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Controle completo sobre acessos web com tecnologia avançada para detectar sites indevidos e garantir produtividade
            </p>
          </div>

          <div className="space-y-32 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const isEven = index % 2 === 0;
              const FeatureIcon = feature.icon;
              return (
                <div
                  key={feature.title || index}
                  {...animateProps()}
                  className={`grid lg:grid-cols-2 gap-12 items-center`}
                >
          <div className={`space-y-6 ${!isEven ? 'lg:order-2' : ''}`}>
              <div className="space-y-4">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg relative group`}>
                <i className={`${FeatureIcon} text-white text-3xl relative z-10`} />
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity`} />
              </div>
                      <div>
                        <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                          {feature.title}
                        </h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {feature.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 group"
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                      <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <i className="fa-solid fa-check text-white text-xs" />
                      </div>
                          <p className="text-foreground/80 group-hover:text-foreground transition-colors">
                            {detail}
                          </p>
                        </div>
                      ))}
                    </div>
                    {/* Borda mais suave para o card de métrica */}
                    <div className={`inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-br ${feature.bgGradient} border border-border/30`}>
                      <div>
                        <div className={`text-3xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                          {feature.metric}
                        </div>
                    <div className="text-sm text-muted-foreground">{feature.metricLabel}</div>
                  </div>
                  <i className="fa-solid fa-arrow-trend-up text-2xl text-green-500" />
                </div>
                   </div>
                   <div className={`relative ${!isEven ? 'lg:order-1' : ''}`}>
                     {/* Borda blur para a imagem/mock */}
                      <div className={`absolute -inset-4 bg-gradient-to-br ${feature.gradient} opacity-20 rounded-3xl blur-2xl`} />
                    {/* Borda mais suave para o card interno */}
                    <div className="relative bg-card border border-border/30 rounded-3xl p-8 shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden group">
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:2rem_2rem]" />
                      </div>
                      <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${feature.gradient} animate-pulse`} />
                            <span className="text-sm font-medium text-muted-foreground">Sistema Ativo</span>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-75" />
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-150" />
                          </div>
                        </div>

                        {/* Mocks condicionais */}
                        {index === 0 && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                            {["Sites Visitados", "URLs Únicas", "Tempo Online"].map((label, i) => (
                              <div key={i} className={`h-24 bg-gradient-to-br ${feature.bgGradient} rounded-xl border border-border/10 flex flex-col items-center justify-center`}>
                                <i className="fa-solid fa-eye text-2xl text-primary animate-pulse mb-2" style={{ animationDelay: `${i * 200}ms` }} />
                                <div className="text-xs text-muted-foreground text-center px-1">{label}</div>
                              </div>
                            ))}
                            </div>
                            <div className="h-32 bg-gradient-to-br from-muted to-muted/50 rounded-xl border border-border/10 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-primary">1,284</div>
                                <div className="text-xs text-muted-foreground">Sites monitorados hoje</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {index === 1 && (
                           <div className="space-y-3">
                            {[
                              { label: "Redes Sociais Bloqueadas", severity: "high", time: "Agora" },
                              { label: "Site de Jogos Detectado", severity: "medium", time: "2 min atrás" },
                              { label: "Conteúdo Impróprio", severity: "high", time: "5 min atrás" }
                            ].map((alert, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/10 hover:bg-muted transition-colors"
                                style={{ animationDelay: `${i * 150}ms` }}
                              >
                              <i className={`fa-solid fa-triangle-exclamation ${alert.severity === 'high' ? 'text-red-500' : 'text-amber-500'} animate-pulse`} />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{alert.label}</div>
                                <div className="text-xs text-muted-foreground">{alert.time}</div>
                              </div>
                              <i className="fa-solid fa-arrow-right text-muted-foreground" />
                              </div>
                            ))}
                          </div>
                        )}
                         {index === 2 && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { label: "Sites Produtivos", value: "67%", color: "green" },
                                { label: "Sites Bloqueados", value: "12%", color: "red" }
                              ].map((metric, i) => (
                                <div key={i} className="p-4 bg-gradient-to-br from-muted to-muted/50 rounded-xl border border-border/10">
                                  <div className={`text-2xl font-bold text-${metric.color}-500`}>{metric.value}</div>
                                  <div className="text-xs text-muted-foreground">{metric.label}</div>
                                </div>
                              ))}
                            </div>
                          <div className="h-40 bg-gradient-to-br from-muted to-muted/50 rounded-xl border border-border/10 flex items-center justify-center relative overflow-hidden">
                            <i className="fa-solid fa-chart-column text-5xl text-primary/50" />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
                          </div>
                          </div>
                        )}
                        {index === 3 && (
                           <div className="space-y-3">
                            {[
                              { name: "Marketing", sites: 234 },
                              { name: "Desenvolvimento", sites: 189 },
                              { name: "Administrativo", sites: 156 }
                            ].map((teamData, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/10 hover:bg-muted transition-colors"
                                style={{ animationDelay: `${i * 150}ms` }}
                              >
                              <i className="fa-solid fa-users text-xl text-primary" />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{teamData.name}</div>
                                <div className="text-xs text-muted-foreground">{teamData.sites} sites acessados hoje</div>
                              </div>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              </div>
                            ))}
                          </div>
                        )}
                        {index === 4 && (
                           <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              {["PDF", "Excel", "CSV", "JSON"].map((format, i) => (
                                <div
                                  key={i}
                                  className="p-3 bg-gradient-to-br from-muted to-muted/50 rounded-xl border border-border/10 text-center hover:scale-105 transition-transform cursor-pointer"
                                >
                                <i className="fa-solid fa-file-lines text-xl text-primary mx-auto mb-2" />
                                <div className="text-xs font-medium">{format}</div>
                              </div>
                              ))}
                            </div>
                            <div className="p-4 bg-muted/50 rounded-xl border border-border/10">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium">Relatório de Acessos</span>
                                <span className="text-xs text-muted-foreground">Último mês</span>
                              </div>
                              <div className="space-y-2">
                                <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-primary to-secondary w-3/4 animate-pulse" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                              <i className="fa-solid fa-bolt text-white" />
                            </div>
                            <span className="text-xs text-muted-foreground">Powered by AI</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Ver mais <i className="fa-solid fa-arrow-right ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-background relative overflow-hidden">
         {/* Gradiente de fundo suave para a seção */}
         <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/50" />
        <div className="container mx-auto px-6 relative z-10">
          <div {...animateProps()} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <i className="fa-solid fa-brain" />
              Tecnologia Avançada
            </div>
            <h2 className="text-5xl font-bold mb-6">
              Como Funciona o <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Monitoramento</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Sistema inteligente que rastreia e analisa todos os acessos web em tempo real
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: "fa-solid fa-magnifying-glass", title: "Detecção Automática", description: "Captura cada URL acessada pelos usuários através de extensão de navegador", gradient: "from-purple-500 to-pink-500" },
              { icon: "fa-solid fa-filter", title: "Categorização Inteligente", description: "IA classifica sites automaticamente em categorias (social, produtivo, impróprio)", gradient: "from-blue-500 to-cyan-500" },
              { icon: "fa-solid fa-triangle-exclamation", title: "Alertas Instantâneos", description: "Notificações em tempo real quando detecta acesso a sites bloqueados", gradient: "from-red-500 to-orange-500" }
            ].map((tech, index) => (
              <div
                key={tech.title || index}
                {...animateProps(index * 150)}
                className="relative group"
              >
                {/* Borda blur para o card */}
                 <div className={`absolute -inset-2 bg-gradient-to-r ${tech.gradient} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-500`} />
                {/* Borda mais suave para o card interno */}
                <div className="relative bg-card border border-border/30 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500">
                  <div className={`w-16 h-16 bg-gradient-to-br ${tech.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <i className={`${tech.icon} text-white text-3xl`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{tech.title}</h3>
                  <p className="text-muted-foreground">{tech.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section - Gradiente forte, mas com opacidade dos elementos de fundo reduzida */}
      <section className="py-32 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:4rem_4rem]" /> {/* grid mais sutil */}
        <div className="container mx-auto px-6 text-center relative z-10">
          <div {...animateProps()} className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-4">
              <i className="fa-solid fa-sparkles" />
              Comece Hoje Mesmo
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Pronto para Monitorar<br />Acessos Web com Inteligência?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Junte-se a centenas de empresas e escolas que já protegem sua produtividade monitorando sites indevidos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-white text-primary hover:bg-white/90 rounded-xl px-8 py-6 text-lg shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300 group"
                size="lg"
              >
                <i className="fa-solid fa-bolt mr-2 group-hover:rotate-12 transition-transform" />
                Começar Monitoramento
              </Button>
              <Button
                onClick={() => setPricingDialogOpen(true)}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 rounded-xl px-8 py-6 text-lg hover:scale-105 transition-all duration-300"
                size="lg"
              >
                <i className="fa-solid fa-file-invoice mr-2" />
                Ver Planos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Borda mais suave */}
      <footer className="bg-card border-t border-border/30 py-20">
         <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="https://i.ibb.co/gF7msvyr/LOGO-PERFIL-1.png"
                  alt="MonitorPro Logo"
                  className="w-12 h-12 rounded-xl shadow-lg"
                />
                <div>
                  <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    MonitorPro
                  </span>
                  <div className="text-xs text-muted-foreground">Web Access Monitor</div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-md mb-6">
                Solução completa de monitoramento de acessos web para empresas e instituições de ensino.
                Detecte sites indevidos e garanta produtividade 24/7.
              </p>
              <div className="flex gap-4">
                {["fa-solid fa-globe", "fa-solid fa-shield-halved", "fa-solid fa-lock"].map((iconClass, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 bg-muted hover:bg-primary/10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 group"
                  >
                    <i className={`${iconClass} text-muted-foreground group-hover:text-primary transition-colors`} />
                  </div>
                ))}
              </div>
            </div>
            {[
              {
                title: "Produto",
                links: ["Recursos", "Dashboard", "Preços", "API", "Extensão"]
              },
              {
                title: "Empresa",
                links: ["Sobre", "Blog", "Casos de Uso", "Contato", "Parceiros"]
              },
              {
                title: "Legal",
                links: ["Privacidade", "LGPD", "Termos", "Cookies", "Compliance"]
              }
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-6 text-lg">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                      >
                        <i className="fa-solid fa-arrow-right text-xs opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-border/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                © 2025 MonitorPro. Todos os direitos reservados.
              </span>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Sistema de monitoramento ativo
                </span>
                <span>|</span>
                <span>Feito com ❤️ no Brasil</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <CookieBanner />

      {/* Estilos CSS - Inalterados, mas agora se complementam com os novos fundos */}
      <style>{`
          @keyframes gradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
          .animate-gradient { animation: gradient 3s ease infinite; }
          .delay-75 { animation-delay: 75ms; }
          .delay-150 { animation-delay: 150ms; }
          .delay-1000 { animation-delay: 1000ms; }
          .delay-700 { animation-delay: 700ms; } /* Adicionado delay para os novos gradientes de fundo */
          .delay-1400 { animation-delay: 1400ms; }
          .delay-2100 { animation-delay: 2100ms; }
          .delay-2800 { animation-delay: 2800ms; }


          [data-animate-on-scroll] {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            will-change: opacity, transform;
            transition-delay: var(--animation-delay, 0ms);
          }
          [data-animate-on-scroll].animate-enter-active {
            opacity: 1;
            transform: translateY(0);
          }
      `}</style>
    </div>
  );
};

export default Landing;
