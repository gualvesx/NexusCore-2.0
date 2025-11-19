import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CompleteProfileDialog } from "@/components/CompleteProfileDialog";

// Definimos um tipo de usuário que une os dados do Auth com os do Firestore
export interface AppUser {
  uid: string;
  email: string | null;
  photoURL: string | null;
  displayName: string | null;
  full_name?: string; // Campo vindo do Firestore
  username?: string;  // Campo vindo do Firestore
  cpf?: string;       // Campo vindo do Firestore
  // Adicione outros campos do banco se necessário
}

interface AuthContextType {
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  isLeader: boolean;
  completeProfileOpen: boolean;
  setCompleteProfileOpen: (open: boolean) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
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
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLeader, setIsLeader] = useState(false);
  const [completeProfileOpen, setCompleteProfileOpen] = useState(false);

  // Função centralizada para buscar dados do Firestore e verificar status
  const checkUserProfile = async (firebaseUser: { uid: string, email: string | null, displayName: string | null, photoURL: string | null }) => {
    try {
      const leaderDocRef = doc(db, "leaders", firebaseUser.uid);
      const leaderDocSnap = await getDoc(leaderDocRef);

      // Objeto base com dados do Auth
      let userData: AppUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        // Valores padrão caso não existam no banco
        full_name: firebaseUser.displayName || "",
        username: firebaseUser.email?.split('@')[0] || ""
      };

      if (leaderDocSnap.exists()) {
        const data = leaderDocSnap.data();
        
        // Mescla dados do Firestore no objeto do usuário
        userData = { 
          ...userData, 
          ...data,
          full_name: data.full_name || userData.full_name // Garante prioridade ao banco
        };

        // Verifica se o perfil está completo para liberar acesso
        if (data.isProfileComplete) {
          setIsLeader(true);
          setCompleteProfileOpen(false);
        } else {
          setIsLeader(false);
          setCompleteProfileOpen(true);
        }
      } else {
        // Usuário autenticado mas sem registro no Firestore
        setIsLeader(false);
        setCompleteProfileOpen(true);
      }

      // Atualiza o estado global do usuário com os dados combinados
      setUser(userData);

    } catch (error) {
      console.error("Erro ao carregar perfil do usuário:", error);
      setIsLeader(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Passamos o objeto do Firebase Auth para a função de carga
        await checkUserProfile(currentUser);
      } else {
        setUser(null);
        setIsLeader(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    // Recarrega os dados se o usuário estiver logado (usado após updates de perfil)
    if (auth.currentUser) {
      await checkUserProfile(auth.currentUser);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsLeader(false);
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
        refreshUser,
      }}
    >
      {children}
      
      <CompleteProfileDialog
        isOpen={completeProfileOpen}
        onClose={() => {
          if (isLeader) setCompleteProfileOpen(false);
        }}
      />
    </AuthContext.Provider>
  );
};