import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Importações de Páginas
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
import TeamDetail from "./pages/TeamDetail"; // A página que criamos

import { ProtectedRoute } from "./components/ProtectedRoute";
import { FilterProvider } from "./contexts/FilterContext"; // Importar o FilterProvider

function App() {
  /*
    Seu main.tsx já cuida de:
    - QueryClientProvider
    - BrowserRouter
    - AuthProvider
    
    Portanto, App.tsx só precisa cuidar dos providers restantes e das rotas.
  */
  return (
    <FilterProvider>
      <TooltipProvider>
        <Routes>
          {/* Rotas Públicas */}
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
          
          {/* Rotas que usam o FilterContext */}
          <Route
            path="/"
            element={<ProtectedRoute component={Index} />}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute component={Index} />}
          />

          {/* Outras rotas protegidas */}
          <Route
            path="/management"
            element={<ProtectedRoute component={Management} />}
          />
          <Route
            path="/team/:id"
            element={<ProtectedRoute component={TeamDetail} />}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute component={Profile} />}
          />

          {/* Rota 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </TooltipProvider>
    </FilterProvider>
  );
}

export default App;