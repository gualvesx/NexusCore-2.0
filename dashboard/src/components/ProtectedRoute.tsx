import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  component: React.ComponentType;
}

// Renomeado para 'ProtectedRoute' com export nomeado
export const ProtectedRoute = ({ component: Component }: ProtectedRouteProps) => {
  const { user, loading, isLeader } = useAuth();
  const location = useLocation();

  // 1. (NOVO) Lida com o estado de carregamento
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Lida com usuário não autenticado ou que não é líder
  // (Redireciona para /login se não for um líder)
  if (!user || !isLeader) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Usuário autenticado e é um líder, renderiza a página
  return <Component />;
};