import { Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Básico",
      price: "R$ 299",
      period: "/mês",
      description: "Ideal para pequenas empresas e startups",
      features: [
        "Até 50 usuários monitorados",
        "Monitoramento em tempo real",
        "Alertas básicos",
        "Relatórios mensais",
        "Suporte por email",
        "Dashboard básico",
      ],
      highlighted: false,
    },
    {
      name: "Profissional",
      price: "R$ 599",
      period: "/mês",
      description: "Para empresas em crescimento",
      features: [
        "Até 200 usuários monitorados",
        "Monitoramento em tempo real",
        "Alertas avançados com IA",
        "Relatórios personalizados",
        "Suporte prioritário 24/7",
        "Dashboard completo",
        "API de integração",
        "Políticas personalizadas",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      period: "",
      description: "Solução completa para grandes organizações",
      features: [
        "Usuários ilimitados",
        "Monitoramento em tempo real",
        "IA avançada de detecção",
        "Relatórios ilimitados",
        "Suporte dedicado 24/7",
        "Dashboard personalizado",
        "API completa",
        "Treinamento da equipe",
        "Compliance e auditoria",
        "Integração com AD/LDAP",
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
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
            <Button 
              onClick={() => navigate("/")} 
              variant="ghost"
              className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              Voltar
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16 animate-fade-in">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Planos e Preços
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para sua organização. Todos incluem 30 dias de teste grátis.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.highlighted
                  ? "border-2 border-primary shadow-2xl shadow-primary/20 scale-105"
                  : "border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Mais Popular
                  </span>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                      : ""
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                  onClick={() => navigate("/cadastro")}
                >
                  {plan.name === "Enterprise" ? "Falar com Vendas" : "Começar Teste Grátis"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-4xl mx-auto">
            <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-4">Garantia de Satisfação</h2>
            <p className="text-muted-foreground mb-6">
              Todos os planos incluem 30 dias de teste grátis. Sem compromisso, cancele quando quiser.
            </p>
            <Button onClick={() => navigate("/cadastro")} size="lg" className="bg-gradient-to-r from-primary to-secondary">
              Começar Agora
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
