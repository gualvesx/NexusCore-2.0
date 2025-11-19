import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  User, 
  initializeAuth, 
  indexedDBLocalPersistence 
} from 'firebase/auth';

console.log("NexusCore: Service Worker Iniciando...");

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDznqrm2kJfKQXxWpgHWwk-msXH89OEgTo",
  authDomain: "banco-vc.firebaseapp.com",
  projectId: "banco-vc",
  storageBucket: "banco-vc.firebasestorage.app",
  messagingSenderId: "858410245985",
  appId: "1:858410245985:web:56fae7da4c145c30a32f20",
  measurementId: "G-4E7K9TY3B7"
};

// Variáveis globais
let app;
let auth: any;
let activeTab: { id: number; url: string; startTime: number } | null = null;
let currentAuthToken: string | null = null;

// --- 1. Inicialização do Firebase (Compatível com Service Worker) ---
try {
  app = initializeApp(firebaseConfig);
  
  // CORREÇÃO CRÍTICA: Service Workers não têm localStorage.
  // Usamos initializeAuth com persistência via IndexedDB.
  auth = initializeAuth(app, {
    persistence: indexedDBLocalPersistence
  });
  
  console.log("NexusCore: Auth inicializado com persistência IndexedDB.");
} catch (e: any) {
  // Se já foi inicializado (hot reload), tentamos pegar a instância existente
  if (e.code === 'app/duplicate-app') {
    console.log("NexusCore: App já inicializado, recuperando instância.");
    // Importação dinâmica para evitar erro de referência circular na inicialização
    import('firebase/app').then(module => {
      app = module.getApp();
      auth = getAuth(app);
    });
  } else {
    console.error("NexusCore: Erro fatal na inicialização:", e);
  }
}

// --- 2. Monitoramento de Usuário ---
if (auth) {
  onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      console.log(`NexusCore: Usuário conectado (${user.email})`);
      try {
        currentAuthToken = await user.getIdToken();
        // Salva status no storage local para a UI saber
        chrome.storage.sync.set({ authMode: 'login' });
      } catch (error) {
        console.error("NexusCore: Erro ao obter token do usuário", error);
      }
    } else {
      console.log("NexusCore: Usuário desconectado.");
      currentAuthToken = null;
    }
  });
}

// --- 3. Comunicação (Mensagens) ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CONFIG_UPDATED') {
    console.log("NexusCore: Configuração atualizada manualmente.");
    // Resetar estado se necessário
    sendResponse({ received: true });
  }
  return true; // Manter canal aberto
});

// --- 4. Sistema de Logs ---
const API_TOKEN_LOG_ENDPOINT = "http://localhost:3000/api/ext/log";
const API_AUTH_LOG_ENDPOINT = "http://localhost:3000/api/ext/log_auth";

async function sendLog(payload: any) {
  try {
    const config = await chrome.storage.sync.get(['authMode', 'nexusTeamId', 'nexusMemberId']);
    
    // Cenário 1: Login via Conta (Google/Email)
    if (config.authMode === 'login' && currentAuthToken) {
      await fetch(API_AUTH_LOG_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentAuthToken}`
        },
        body: JSON.stringify(payload),
      });
    } 
    // Cenário 2: Token Manual (Equipe + Membro)
    else if (config.nexusTeamId && config.nexusMemberId) {
      const logData = {
        ...payload,
        teamId: config.nexusTeamId,
        memberId: config.nexusMemberId
      };
      
      await fetch(API_TOKEN_LOG_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
    }
  } catch (error) {
    // Falhas de rede são esperadas se o server cair, não spamar erro
    // console.debug("Falha no envio do log", error);
  }
}

// --- 5. Rastreamento de Abas ---
async function endActiveTabSession() {
  if (!activeTab) return;
  
  const endTime = Date.now();
  const duration = Math.round((endTime - activeTab.startTime) / 1000);
  
  // Filtra logs muito curtos (< 2s) ou URLs irrelevantes
  if (duration > 2 && activeTab.url && !activeTab.url.startsWith('chrome://')) {
    // Enviar log sem bloquear a thread principal
    sendLog({
      url: activeTab.url,
      timestamp: new Date(activeTab.startTime).toISOString(),
      duration: duration,
    }).catch(err => console.debug("Erro background log:", err));
  }
  activeTab = null;
}

function startActiveTabSession(tabId: number, url: string) {
  // Finaliza anterior antes de começar nova
  if (activeTab) endActiveTabSession();
  
  // Ignora páginas internas do navegador
  if (url && !url.startsWith('chrome://') && !url.startsWith('about:') && !url.startsWith('edge://')) {
    activeTab = { id: tabId, url, startTime: Date.now() };
  }
}

// Listeners de Eventos de Navegação
chrome.tabs.onActivated.addListener(async (info) => {
  await endActiveTabSession();
  try {
    const tab = await chrome.tabs.get(info.tabId);
    if (tab?.url) startActiveTabSession(info.tabId, tab.url);
  } catch (e) { /* Tab fechada ou inacessível */ }
});

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  if (change.status === 'complete' && tab.active && tab.url) {
    startActiveTabSession(tabId, tab.url);
  }
});

chrome.idle.onStateChanged.addListener((newState) => {
  if (newState === 'active') {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]?.url) startActiveTabSession(tabs[0].id!, tabs[0].url);
    });
  } else {
    endActiveTabSession(); // Usuário ficou inativo, fecha sessão
  }
});