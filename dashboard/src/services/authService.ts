import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  cpf?: string;
  birthDate?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      return { success: true, message: 'Login realizado com sucesso' };
    } catch (error: any) {
      console.error("Erro Login:", error);
      let message = "Erro ao fazer login";
      if (error.code === 'auth/invalid-credential') message = "E-mail ou senha incorretos.";
      if (error.code === 'auth/user-not-found') message = "Usuário não encontrado.";
      if (error.code === 'auth/wrong-password') message = "Senha incorreta.";
      throw new Error(message);
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // 1. Cria o usuário no Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // 2. Atualiza o nome no perfil do Auth
      await updateProfile(userCredential.user, {
        displayName: data.fullName
      });

      // 3. Envia email de verificação (opcional, mas recomendado)
      // await sendEmailVerification(userCredential.user);

      // 4. Salva dados no Firestore COM a flag de perfil completo
      // IMPORTANTE: Aqui setamos isProfileComplete: true pois ele preencheu o form completo
      await setDoc(doc(db, "leaders", userCredential.user.uid), {
        full_name: data.fullName,
        username: data.username,
        email: data.email,
        cpf: data.cpf || '',
        birthDate: data.birthDate || '',
        createdAt: new Date().toISOString(),
        isProfileComplete: true // <--- ESTA FLAG LIBERA O ACESSO NO DASHBOARD
      });

      return { success: true, message: 'Conta criada com sucesso!' };
    } catch (error: any) {
      console.error("Erro Registro:", error);
      let message = "Erro ao criar conta";
      
      // Tratamento de erros comuns do Firebase
      if (error.code === 'auth/email-already-in-use') {
        message = "Este e-mail já está sendo usado por outra conta.";
      } else if (error.code === 'auth/weak-password') {
        message = "A senha é muito fraca. Use pelo menos 6 caracteres.";
      } else if (error.code === 'auth/invalid-email') {
        message = "O formato do e-mail é inválido.";
      }
      
      throw new Error(message);
    }
  },

  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const docRef = doc(db, "leaders", result.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Se é o primeiro acesso via Google, cria o doc mas MARCA COMO INCOMPLETO
        await setDoc(docRef, {
          full_name: result.user.displayName || '',
          username: result.user.email?.split('@')[0] || '',
          email: result.user.email || '',
          createdAt: new Date().toISOString(),
          isProfileComplete: false // <--- FORÇA ABRIR O MODAL DE COMPLETAR CADASTRO
        });
      }

      return { success: true, message: 'Login realizado com sucesso' };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login com Google');
    }
  },

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  },

  // ... manter os outros métodos (forgotPassword, etc) ...
    async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { 
        success: true, 
        message: 'Email de recuperação enviado com sucesso' 
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao enviar email');
    }
  },

  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<AuthResponse> {
    return { 
      success: true, 
      message: 'Use o link enviado no email para redefinir sua senha' 
    };
  },

  async updateProfile(fullName: string): Promise<AuthResponse> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Usuário não autenticado');

      await updateProfile(currentUser, {
        displayName: fullName
      });

      await setDoc(doc(db, "leaders", currentUser.uid), {
        full_name: fullName
      }, { merge: true });

      return { success: true, message: 'Perfil atualizado com sucesso' };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar perfil');
    }
  },
};