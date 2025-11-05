import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
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
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Política de Privacidade</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Informações que Coletamos</h2>
            <p>
              Coletamos informações que você nos fornece diretamente, incluindo nome, e-mail, 
              dados de navegação e outras informações necessárias para fornecer nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Como Usamos suas Informações</h2>
            <p>
              Utilizamos suas informações para fornecer, manter e melhorar nossos serviços, 
              além de comunicar com você sobre atualizações e novidades.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Compartilhamento de Informações</h2>
            <p>
              Não vendemos suas informações pessoais. Compartilhamos dados apenas quando necessário 
              para fornecer nossos serviços ou quando exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Segurança</h2>
            <p>
              Implementamos medidas de segurança adequadas para proteger suas informações contra 
              acesso não autorizado, alteração, divulgação ou destruição.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Seus Direitos</h2>
            <p>
              Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. 
              Entre em contato conosco para exercer esses direitos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Alterações a Esta Política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos você sobre mudanças 
              significativas publicando a nova política em nosso site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cookies</h2>
            <p>
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso 
              do site e personalizar conteúdo. Você pode gerenciar suas preferências de cookies através 
              das configurações do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contato</h2>
            <p>
              Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato através 
              do e-mail: <a href="mailto:contato@nexuscore.com" className="text-primary hover:underline">contato@nexuscore.com</a>
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

export default Privacy;
