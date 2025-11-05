import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // Assumindo que db é exportado de firebase
import { doc, getDoc } from "firebase/firestore";
import { CompleteProfileDialog } from "@/components/CompleteProfileDialog";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  isLeader: boolean; // Flag para saber se é um líder
  completeProfileOpen: boolean;
  setCompleteProfileOpen: (open: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLeader, setIsLeader] = useState(false);
  const [completeProfileOpen, setCompleteProfileOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Verificar se o usuário é um líder na coleção 'leaders'
          const leaderDocRef = doc(db, "leaders", user.uid);
          const leaderDocSnap = await getDoc(leaderDocRef);

          if (leaderDocSnap.exists()) {
            // É um líder
            setUser(user);
            setIsLeader(true);
          } else {
            // Não é um líder, mas está autenticado
            // Vamos verificar se ele precisa completar o perfil
            // (Isso pode ser um novo líder se cadastrando)
            setUser(user);
            setIsLeader(false);
            setCompleteProfileOpen(true); // Abre o diálogo para completar o perfil
          }
        } catch (error) {
          console.error("Erro ao verificar perfil de líder:", error);
          setUser(null); // Desloga em caso de erro
          setIsLeader(false);
        }
      } else {
        // Usuário deslogado
        setUser(null);
        setIsLeader(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsLeader(false);
      // Redirecionamento será tratado pelo ProtectedRoute
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        setLoading,
        isLeader,
        completeProfileOpen,
        setCompleteProfileOpen,
        logout,
      }}
    >
      {/* =========================================================
        CORREÇÃO AQUI: Removemos o "!loading &&"
        O contexto DEVE sempre renderizar seus filhos.
        A Rota Protegida vai cuidar do estado de carregamento.
        =========================================================
      */}
      {children}
      
      {/* O diálogo de completar perfil é renderizado aqui */}
      <CompleteProfileDialog
        open={completeProfileOpen}
        onOpenChange={setCompleteProfileOpen}
      />
    </AuthContext.Provider>
  );
};