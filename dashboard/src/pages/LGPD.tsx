import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LGPD = () => {
  const navigate = useNavigate();

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

      <div className="container mx-auto px-6 py-16 max-w-4xl animate-fade-in">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">LGPD - Lei Geral de Proteção de Dados</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Compromisso com a LGPD</h2>
            <p>
              A NexusCore Security está totalmente comprometida com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) 
              e garante que todos os dados pessoais são tratados com segurança, privacidade e transparência.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Base Legal para Tratamento de Dados</h2>
            <p>
              Tratamos seus dados pessoais com base em fundamentos legais, incluindo seu consentimento, 
              execução de contrato, cumprimento de obrigação legal e legítimo interesse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Seus Direitos como Titular de Dados</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmação da existência de tratamento</li>
              <li>Acesso aos dados</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Portabilidade dos dados a outro fornecedor</li>
              <li>Eliminação dos dados pessoais tratados com consentimento</li>
              <li>Informação sobre compartilhamento de dados</li>
              <li>Revogação do consentimento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Segurança dos Dados</h2>
            <p>
              Implementamos medidas técnicas e administrativas adequadas para proteger seus dados pessoais 
              contra acessos não autorizados e situações acidentais ou ilícitas de destruição, perda, 
              alteração, comunicação ou difusão.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Encarregado de Proteção de Dados (DPO)</h2>
            <p>
              Nosso Encarregado de Proteção de Dados está disponível para esclarecer dúvidas e receber 
              comunicações dos titulares de dados através do e-mail:{" "}
              <a href="mailto:dpo@nexuscore.com" className="text-primary hover:underline">dpo@nexuscore.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Tempo de Armazenamento</h2>
            <p>
              Mantemos seus dados pessoais apenas pelo tempo necessário para as finalidades informadas, 
              ou conforme exigido por obrigações legais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Compartilhamento de Dados</h2>
            <p>
              Seus dados podem ser compartilhados com parceiros e fornecedores para execução dos serviços, 
              sempre garantindo a mesma proteção e cuidado com suas informações.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Exercício de Direitos</h2>
            <p>
              Para exercer seus direitos garantidos pela LGPD, entre em contato através do e-mail:{" "}
              <a href="mailto:lgpd@nexuscore.com" className="text-primary hover:underline">lgpd@nexuscore.com</a>
            </p>
          </section>
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          Última atualização: Janeiro de 2025
        </div>
      </div>
    </div>
  );
};

export default LGPD;
