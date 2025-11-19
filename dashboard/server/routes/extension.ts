import { Router } from 'express';
import admin from 'firebase-admin';

const router = Router();

// REMOVIDO DAQUI: const db = admin.firestore(); 
// Motivo: Evitar erro de inicialização antes do index.ts carregar

// --- ROTA 1: Log via Token (Equipe ID + Membro ID) ---
router.post('/log', async (req, res) => {
  try {
    // CORREÇÃO: Inicializa o DB apenas quando a requisição chega
    const db = admin.firestore();

    const { teamId, memberId, url, duration, timestamp } = req.body;

    if (!teamId || !memberId || !url) {
      return res.status(400).json({ error: 'Dados incompletos: teamId, memberId e url são obrigatórios.' });
    }

    console.log(`📝 Log recebido (Token): Equipe ${teamId} - Membro ${memberId} - ${url}`);

    await db.collection('logs').add({
      teamId,
      studentId: memberId,
      url,
      duration: Number(duration),
      timestamp: timestamp || new Date().toISOString(),
      categoria: await classificarUrl(url),
      source: 'extension_token',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao salvar log (Token):', error);
    return res.status(500).json({ error: 'Erro interno ao salvar log.' });
  }
});

// --- ROTA 2: Log via Autenticação (Google/Email) ---
router.post('/log_auth', async (req, res) => {
  try {
    // CORREÇÃO: Inicializa o DB aqui também
    const db = admin.firestore();
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const { url, duration, timestamp } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória.' });
    }

    console.log(`👤 Log recebido (Auth): ${email} - ${url}`);

    await db.collection('logs').add({
      userId: uid,
      userEmail: email,
      url,
      duration: Number(duration),
      timestamp: timestamp || new Date().toISOString(),
      categoria: await classificarUrl(url),
      source: 'extension_auth',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao salvar log (Auth):', error);
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
});

// Função auxiliar
async function classificarUrl(url: string): Promise<string> {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('chatgpt') || urlLower.includes('openai') || urlLower.includes('claude')) return 'IA';
  if (urlLower.includes('youtube') || urlLower.includes('netflix')) return 'Entretenimento';
  if (urlLower.includes('facebook') || urlLower.includes('instagram') || urlLower.includes('twitter')) return 'Rede Social';
  if (urlLower.includes('github') || urlLower.includes('stackoverflow') || urlLower.includes('docs')) return 'Estudo/Trabalho';
  return 'Outros';
}

export default router;