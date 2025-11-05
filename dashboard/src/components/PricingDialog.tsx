import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const plans = [
  {
    name: "Básico",
    price: "R$ 199",
    period: "/mês",
    description: "Ideal para pequenas equipes",
    features: [
      "Até 25 usuários monitorados",
      "Monitoramento em tempo real",
      "Alertas básicos",
      "Relatórios mensais",
      "Suporte por email"
    ],
    highlighted: false
  },
  {
    name: "Profissional",
    price: "R$ 499",
    period: "/mês",
    description: "Para empresas em crescimento",
    features: [
      "Até 100 usuários monitorados",
      "Todos os recursos do Básico",
      "Alertas personalizados",
      "Relatórios semanais",
      "Dashboard avançado",
      "Suporte prioritário"
    ],
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "R$ 999",
    period: "/mês",
    description: "Para grandes organizações",
    features: [
      "Usuários ilimitados",
      "Todos os recursos do Profissional",
      "API de integração",
      "Relatórios personalizados",
      "Gerente de conta dedicado",
      "SLA garantido"
    ],
    highlighted: false
  }
];

export function PricingDialog({ open, onOpenChange }: PricingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl text-center mb-2">
            Escolha o Plano Ideal
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            Selecione o plano que melhor atende às necessidades da sua empresa
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                plan.highlighted
                  ? "border-primary bg-gradient-to-b from-primary/5 to-primary/10 shadow-lg"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-bold">
                  Mais Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    : ""
                }`}
                variant={plan.highlighted ? "default" : "outline"}
              >
                Começar Agora
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Todos os planos incluem 14 dias de teste grátis. Cancele quando quiser.
        </p>
      </DialogContent>
    </Dialog>
  );
}
