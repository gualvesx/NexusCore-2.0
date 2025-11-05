import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// ESTA É A CONFIGURAÇÃO DO FIREBASE DO *FRONTEND* (DASHBOARD)
const firebaseConfig = {
  apiKey: "AIzaSyDznqrm2kJfKQXxWpgHWwk-msXH89OEgTo",
  authDomain: "banco-vc.firebaseapp.com",
  projectId: "banco-vc",
  storageBucket: "banco-vc.firebasestorage.app",
  messagingSenderId: "858410245985",
  appId: "1:858410245985:web:56fae7da4c145c30a32f20",
  measurementId: "G-4E7K9TY3B7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // NÃO EXPORTE
const googleProvider = new GoogleAuthProvider(); // NÃO EXPORTE

console.log("NexusCore Background Service Started.");

// ENDPOINTS DO SEU SERVIDOR BACKEND
const API_TOKEN_LOG_ENDPOINT = "http://localhost:3000/api/ext/log"; // Modo 1/3
const API_AUTH_LOG_ENDPOINT = "http://localhost:3000/api/ext/log_auth"; // Modo 2

// Estado de rastreamento de atividade
interface ActiveTabInfo {
  id: number;
  url: string;
  startTime: number; // Timestamp (Date.now())
}

let activeTab: ActiveTabInfo | null = null;
let systemState: "active" | "idle" | "locked" = "active";

// --- Configuração e Tipos ---
interface ExtensionConfig {
  authMode?: 'token' | 'login';
  teamId?: string;
  memberId?: string;
}

interface LogPayload {
  teamId?: string;
  memberId?: string;
  url: string;
  timestamp: string;
  duration: number; // Duração em segundos
}

let currentUser: User | null = null;
let currentAuthToken: string | null = null;

// Observador de estado de autenticação
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    currentAuthToken = await user.getIdToken();
    console.log("NexusCore: Membro logado na extensão:", user.email);
    chrome.storage.sync.set({ authMode: 'login' }); 
  } else {
    currentUser = null;
    currentAuthToken = null;
    console.log("NexusCore: Nenhum membro logado na extensão.");
    if (activeTab) {
      await endActiveTabSession();
    }
  }
  
  // **NOVO**: Notifica a página de opções sobre a mudança
  chrome.runtime.sendMessage({ type: 'AUTH_STATE_CHANGED', user: currentUser });
});

// Atualiza o token de autenticação periodicamente
setInterval(async () => {
  if (currentUser) {
    try {
      currentAuthToken = await currentUser.getIdToken(true); // Força a atualização
    } catch (error) {
      console.error("NexusCore: Falha ao atualizar token de auth.", error);
      await auth.signOut();
    }
  }
}, 10 * 60 * 1000); // A cada 10 minutos

async function getConfig(): Promise<ExtensionConfig> {
  try {
    const config = await chrome.storage.sync.get(['authMode', 'teamId', 'memberId']);
    return config as ExtensionConfig;
  } catch (error) {
    console.error("NexusCore: Erro ao ler config:", error);
    return {};
  }
}

// --- Funções de Envio de Log (Modo 1 e 2) ---

async function sendLog(payload: LogPayload) {
  const config = await getConfig();

  if (config.authMode === 'login') {
    if (!currentAuthToken) {
      console.warn("NexusCore: Modo Login, mas sem usuário. Log descartado.");
      return;
    }
    await sendAuthenticatedLog(payload, currentAuthToken);
  } else if (config.authMode === 'token') {
    if (!config.teamId || !config.memberId) {
      console.warn("NexusCore: Modo Token, mas não configurado. Log descartado.");
      return;
    }
    payload.teamId = config.teamId;
    payload.memberId = config.memberId;
    await sendTokenLog(payload);
  } else {
    console.warn("NexusCore: Modo de autenticação não definido. Configure na página de opções.");
  }
}

async function sendTokenLog(payload: LogPayload) {
  console.log("NexusCore: Enviando log (Modo Token):", payload);
  try {
    const response = await fetch(API_TOKEN_LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("NexusCore: Falha (Token):", response.status, errorData.error);
    }
  } catch (error) {
    console.error("NexusCore: Erro de rede (Token):", error);
  }
}

async function sendAuthenticatedLog(payload: LogPayload, token: string) {
  console.log("NexusCore: Enviando log (Modo Auth):", payload);
  try {
    const response = await fetch(API_AUTH_LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("NexusCore: Falha (Auth):", response.status, errorData.error);
    }
  } catch (error) {
    console.error("NexusCore: Erro de rede (Auth):", error);
  }
}

// --- Lógica de Rastreamento de Tempo ---

async function endActiveTabSession() {
  if (!activeTab || systemState !== "active") {
    activeTab = null;
    return;
  }

  const endTime = Date.now();
  const durationInSeconds = Math.round((endTime - activeTab.startTime) / 1000);
  
  if (durationInSeconds > 3) {
    const payload: LogPayload = {
      url: activeTab.url,
      timestamp: new Date(activeTab.startTime).toISOString(),
      duration: durationInSeconds,
    };
    await sendLog(payload);
  }

  activeTab = null;
}

function startActiveTabSession(tabId: number, url: string) {
  if (activeTab && activeTab.id !== tabId) {
    endActiveTabSession();
  }
  
  if (isValidUrl(url)) {
    activeTab = {
      id: tabId,
      url: url,
      startTime: Date.now(),
    };
  }
}

function isValidUrl(url: string | undefined): url is string {
  if (!url) return false;
  if (url.startsWith("chrome://") || url.startsWith("about:")) {
    return false;
  }
  return url.startsWith("http://") || url.startsWith("https://");
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await endActiveTabSession();
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && tab.active) {
      startActiveTabSession(activeInfo.tabId, tab.url);
    }
  } catch (error) {
    activeTab = null;
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active && isValidUrl(tab.url)) {
    await endActiveTabSession();
    startActiveTabSession(tabId, tab.url!);
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await endActiveTabSession();
  } else {
    try {
      const [tab] = await chrome.tabs.query({ active: true, windowId: windowId });
      if (tab && tab.id && tab.url) {
        startActiveTabSession(tab.id, tab.url);
      }
    } catch (error) {
      // Ignora o erro
    }
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (activeTab && activeTab.id === tabId) {
    await endActiveTabSession();
  }
});

chrome.idle.setDetectionInterval(60);

chrome.idle.onStateChanged.addListener(async (newState) => {
  systemState = newState;
  
  if (newState === "active") {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id && tab.url) {
        startActiveTabSession(tab.id, tab.url);
      }
    } catch (error) {
       // Ignora o erro
    }
  } else {
    await endActiveTabSession();
  }
});

// Listener para a página de opções (options.ts)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "LOGIN_WITH_GOOGLE") {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        sendResponse({ success: true, user: result.user });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Resposta assíncrona
  }
  
  if (request.type === "LOGIN_WITH_EMAIL") {
    signInWithEmailAndPassword(auth, request.email, request.password)
      .then((result) => {
        sendResponse({ success: true, user: result.user });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Resposta assíncrona
  }
  
  if (request.type === "LOGOUT") {
     auth.signOut()
      .then(() => {
         sendResponse({ success: true });
      })
      .catch((error) => {
         sendResponse({ success: false, error: error.message });
      });
    return true; // Resposta assíncrona
  }
  
  // **NOVO**: Responde à página de opções com o estado de login atual
  if (request.type === "GET_AUTH_STATE") {
    sendResponse({ user: currentUser });
    return false; // Resposta síncrona
  }
});