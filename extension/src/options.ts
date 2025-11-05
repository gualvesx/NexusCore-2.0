console.log("Options page loaded. No imports here.");

// --- Elementos da UI ---
const modeSelector = document.getElementById('auth-mode') as HTMLSelectElement;
const tokenSection = document.getElementById('token-section');
const loginSection = document.getElementById('login-section');

// --- Seção Token (Modo 1/3) ---
const saveButton = document.getElementById('save-token') as HTMLButtonElement;
const teamIdInput = document.getElementById('teamId') as HTMLInputElement;
const memberIdInput = document.getElementById('memberId') as HTMLInputElement;
const statusToken = document.getElementById('status-token')!;

saveButton?.addEventListener('click', () => {
  const teamId = teamIdInput.value;
  const memberId = memberIdInput.value;

  if (!teamId || !memberId) {
    statusToken.textContent = 'Erro: Preencha todos os campos.';
    statusToken.style.color = 'red';
    return;
  }

  // Salva no storage e define o modo
  chrome.storage.sync.set(
    {
      authMode: 'token',
      teamId: teamId,
      memberId: memberId,
    },
    () => {
      statusToken.textContent = 'Modo Token salvo!';
      statusToken.style.color = 'green';
      setTimeout(() => { statusToken.textContent = ''; }, 2000);
    }
  );
});

// --- Seção Login (Modo 2) ---
const loginGoogleButton = document.getElementById('login-google') as HTMLButtonElement;
const loginEmailButton = document.getElementById('login-email') as HTMLButtonElement;
const logoutButton = document.getElementById('logout') as HTMLButtonElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const statusAuth = document.getElementById('status-auth')!;

loginGoogleButton?.addEventListener('click', () => {
  statusAuth.textContent = 'Abrindo pop-up do Google...';
  statusAuth.style.color = 'gray';
  
  // Envia mensagem para o background.ts para lidar com o pop-up
  chrome.runtime.sendMessage({ type: "LOGIN_WITH_GOOGLE" }, (response) => {
    if (response.success) {
      updateLoginStatus(response.user);
      // Salva o modo 'login'
      chrome.storage.sync.set({ authMode: 'login' });
    } else {
      statusAuth.textContent = `Erro: ${response.error}`;
      statusAuth.style.color = 'red';
    }
  });
});

loginEmailButton?.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  if (!email || !password) {
    statusAuth.textContent = 'Preencha email e senha.';
    statusAuth.style.color = 'red';
    return;
  }
  
  statusAuth.textContent = 'Autenticando...';
  statusAuth.style.color = 'gray';

  // Envia mensagem para o background.ts
  chrome.runtime.sendMessage({ type: "LOGIN_WITH_EMAIL", email, password }, (response) => {
    if (response.success) {
      updateLoginStatus(response.user);
      // Salva o modo 'login'
      chrome.storage.sync.set({ authMode: 'login' });
    } else {
      statusAuth.textContent = `Erro: ${response.error}`;
      statusAuth.style.color = 'red';
    }
  });
});

logoutButton?.addEventListener('click', () => {
  // Envia mensagem para o background.ts
  chrome.runtime.sendMessage({ type: "LOGOUT" }, (response) => {
    if (response.success) {
      updateLoginStatus(null);
    } else {
      statusAuth.textContent = `Erro: ${response.error}`;
      statusAuth.style.color = 'red';
    }
  });
});

// --- Lógica de UI (Tabs e Estado Inicial) ---

function toggleMode(mode: string) {
  if (mode === 'token') {
    tokenSection.style.display = 'block';
    loginSection.style.display = 'none';
  } else {
    tokenSection.style.display = 'none';
    loginSection.style.display = 'block';
  }
}

modeSelector?.addEventListener('change', (e) => {
  const newMode = (e.target as HTMLSelectElement).value;
  toggleMode(newMode);
  // Salva a seleção do modo
  chrome.storage.sync.set({ authMode: newMode });
});

function restoreOptions() {
  // Restaura os campos do modo token
  chrome.storage.sync.get(
    { authMode: 'token', teamId: '', memberId: '' },
    (items) => {
      teamIdInput.value = items.teamId;
      memberIdInput.value = items.memberId;
      modeSelector.value = items.authMode;
      toggleMode(items.authMode);
    }
  );
  
  // Pede ao background o status de login atual
  chrome.runtime.sendMessage({ type: "GET_AUTH_STATE" }, (response) => {
    if (response.user) {
      updateLoginStatus(response.user);
    } else {
      updateLoginStatus(null);
    }
  });
}

function updateLoginStatus(user: any) { // 'any' porque não podemos importar o tipo User
   if (user) {
      statusAuth.textContent = `Logado como: ${user.email}`;
      statusAuth.style.color = 'green';
   } else {
      statusAuth.textContent = 'Você não está logado.';
      statusAuth.style.color = 'gray';
   }
}

document.addEventListener('DOMContentLoaded', restoreOptions);

// Ouve por mudanças de auth (ex: se o usuário deslogar)
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'AUTH_STATE_CHANGED') {
    updateLoginStatus(request.user);
  }
});