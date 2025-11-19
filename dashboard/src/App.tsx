import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Páginas
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Management from "./pages/Management";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import LGPD from "./pages/LGPD";
import PublicDashboard from "./pages/PublicDashboard";
import NotFound from "./pages/NotFound";
import TeamDetail from "./pages/TeamDetail";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { FilterProvider } from "./contexts/FilterContext";
import { useAuth } from "@/contexts/AuthContext"; // Importar useAuth
import { CompleteProfileDialog } from "@/components/CompleteProfileDialog"; // Importar Dialog

function App() {
  // Consumir o contexto aqui para controlar o modal globalmente
  const { completeProfileOpen, setCompleteProfileOpen, isLeader } = useAuth();

  return (
    <FilterProvider>
      <TooltipProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/lgpd" element={<LGPD />} />
          <Route path="/public" element={<PublicDashboard />} />

          {/* Rotas de Autenticação */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rotas Protegidas */}
          <Route path="/dashboard" element={<ProtectedRoute component={Index} />} />
          <Route path="/management" element={<ProtectedRoute component={Management} />} />
          <Route path="/team/:id" element={<ProtectedRoute component={TeamDetail} />} />
          <Route path="/profile" element={<ProtectedRoute component={Profile} />} />

          {/* Rota 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Toaster />
        
        {/* Renderiza o modal de completar perfil no nível da aplicação */}
        <CompleteProfileDialog 
          isOpen={completeProfileOpen} 
          onClose={() => {
             if (isLeader) setCompleteProfileOpen(false);
          }}
        />

      </TooltipProvider>
    </FilterProvider>
  );
}

export default App;