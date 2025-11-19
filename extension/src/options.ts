import { auth } from './lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// Elementos
const authModeSelect = document.getElementById('auth-mode') as HTMLSelectElement;
const tokenSection = document.getElementById('token-section') as HTMLDivElement;
const loginSection = document.getElementById('login-section') as HTMLDivElement;

const teamIdInput = document.getElementById('teamId') as HTMLInputElement;
const memberIdInput = document.getElementById('memberId') as HTMLInputElement;
const saveTokenBtn = document.getElementById('save-token') as HTMLButtonElement;
const statusToken = document.getElementById('status-token') as HTMLDivElement;

const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const loginEmailBtn = document.getElementById('login-email') as HTMLButtonElement;
const loginGoogleBtn = document.getElementById('login-google') as HTMLButtonElement;
const logoutBtn = document.getElementById('logout') as HTMLButtonElement;
const statusAuth = document.getElementById('status-auth') as HTMLDivElement;

// Função para alternar a visualização
function toggleSection(mode: string) {
  if (mode === 'token') {
    tokenSection.classList.remove('hidden');
    loginSection.classList.add('hidden');
  } else {
    tokenSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
  }
}

// 1. Listener de troca de modo
if (authModeSelect) {
  authModeSelect.addEventListener('change', (e) => {
    toggleSection((e.target as HTMLSelectElement).value);
  });
}

// 2. Carregar dados salvos ao abrir
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['nexusTeamId', 'nexusMemberId', 'authMode'], (items) => {
    if (items.nexusTeamId && teamIdInput) teamIdInput.value = items.nexusTeamId;
    if (items.nexusMemberId && memberIdInput) memberIdInput.value = items.nexusMemberId;
    
    // Restaura a seleção anterior ou padrão para token
    if (items.authMode && (items.authMode === 'login' || items.authMode === 'token')) {
      if (authModeSelect) authModeSelect.value = items.authMode;
      toggleSection(items.authMode);
    } else {
      toggleSection('token');
    }
  });
});

// 3. Salvar Token (CORRIGIDO O ERRO DE CONEXÃO)
if (saveTokenBtn) {
  saveTokenBtn.addEventListener('click', async () => {
    const teamId = teamIdInput.value.trim();
    const memberId = memberIdInput.value.trim();
  
    if (!teamId || !memberId) {
      statusToken.textContent = 'Preencha todos os campos.';
      statusToken.style.color = 'red';
      return;
    }
  
    saveTokenBtn.textContent = 'Salvando...';
    saveTokenBtn.disabled = true;
    
    try {
      // Salva no storage do Chrome (Isso é o que importa!)
      await chrome.storage.sync.set({
        nexusTeamId: teamId,
        nexusMemberId: memberId,
        authMode: 'token'
      });
  
      statusToken.textContent = 'Salvo com sucesso!';
      statusToken.style.color = 'green';
      
      // Tenta avisar o background, mas se falhar, não tem problema
      // O catch aqui previne o erro vermelho na tela do usuário
      chrome.runtime.sendMessage({ type: 'CONFIG_UPDATED' }).catch(() => {
        console.log("Background inativo no momento, mas a configuração foi salva no disco.");
      });
  
    } catch (error) {
      console.error(error);
      statusToken.textContent = 'Erro ao salvar.';
      statusToken.style.color = 'red';
    } finally {
      saveTokenBtn.textContent = 'Salvar Token';
      saveTokenBtn.disabled = false;
      setTimeout(() => {
        if (statusToken.style.color === 'green') statusToken.textContent = '';
      }, 3000);
    }
  });
}

// 4. Login Email
if (loginEmailBtn) {
  loginEmailBtn.addEventListener('click', async () => {
    try {
      loginEmailBtn.textContent = '...';
      await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    } catch (error: any) {
      statusAuth.textContent = "Erro: " + error.code;
      statusAuth.style.color = 'red';
      loginEmailBtn.textContent = 'Entrar com Email';
    }
  });
}

// 5. Login Google
if (loginGoogleBtn) {
  loginGoogleBtn.addEventListener('click', async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error(error);
      statusAuth.textContent = "Erro Google. Tente fechar e abrir.";
      statusAuth.style.color = 'red';
    }
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => signOut(auth));
}

// Monitorar Auth para atualizar UI
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (statusAuth) {
      statusAuth.textContent = `Logado: ${user.email}`;
      statusAuth.style.color = 'green';
    }
    loginEmailBtn?.classList.add('hidden');
    loginGoogleBtn?.classList.add('hidden');
    emailInput?.classList.add('hidden');
    passwordInput?.classList.add('hidden');
    logoutBtn?.classList.remove('hidden');
    
    chrome.storage.sync.set({ authMode: 'login' });
  } else {
    if (statusAuth) statusAuth.textContent = '';
    loginEmailBtn?.classList.remove('hidden');
    loginGoogleBtn?.classList.remove('hidden');
    emailInput?.classList.remove('hidden');
    passwordInput?.classList.remove('hidden');
    logoutBtn?.classList.add('hidden');
  }
});