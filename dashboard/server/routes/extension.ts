import { Router } from 'express';
import admin from 'firebase-admin';
import { collection, query, where, getDocs, addDoc, limit, Timestamp } from 'firebase-firestore';
import { authenticateToken } from './auth'; // Vamos reusar o middleware de autenticação

// Obter a instância do Firestore do admin inicializado em index.ts
const db = admin.firestore();
const router = Router();

interface LogPayload {
  teamId?: string; // Usado no Modo Token
  memberId?: string; // Usado no Modo Token (pc_id ou cpf)
  url: string;
  timestamp: string; // Formato ISO 8601
  duration: number;
}

/**
 * (Placeholder) Função de classificação de IA.
 * Substitua pela sua lógica real de classificação.
 */
async function classifyUrl(url: string): Promise<string> {
  try {
    const domain = new URL(url).hostname.replace('www.', '');

    if (
      domain.includes('facebook.com') ||
      domain.includes('twitter.com') ||
      domain.includes('instagram.com') ||
      domain.includes('linkedin.com') ||
      domain.includes('tiktok.com')
    ) {
      return 'Rede Social';
    }
    if (domain.includes('youtube.com') || domain.includes('netflix.com') || domain.includes('twitch.tv')) {
      return 'Streaming & Jogos';
    }
    if (domain.includes('chatgpt.com') || domain.includes('gemini.google.com') || domain.includes('claude.ai')) {
      return 'IA';
    }
    if (domain.includes('wikipedia.org') || domain.includes('stackoverflow.com')) {
      return 'Educacional';
    }
    return 'Outros';
  } catch (error) {
    console.error('Erro ao classificar URL:', error);
    return 'Outros';
  }
}

/**
 * Função auxiliar para buscar um membro pelo pc_id ou cpf
 */
async function findMember(memberId: string) {
  const membersRef = db.collection('members');
  let memberSnap = await getDocs(query(membersRef, where('pc_id', '==', memberId), limit(1)));

  if (memberSnap.empty) {
    memberSnap = await getDocs(query(membersRef, where('cpf', '==', memberId), limit(1)));
  }

  if (memberSnap.empty) {
    return null;
  }
  
  const memberDoc = memberSnap.docs[0];
  return { id: memberDoc.id, ...memberDoc.data() };
}

/**
 * Função auxiliar para validar a associação à equipe
 */
async function isMemberOfTeam(memberDocId: string, teamId: string): Promise<boolean> {
  const teamMemberRef = db.collection('team_members');
  const teamQuery = query(
    teamMemberRef,
    where('teamId', '==', teamId),
    where('studentId', '==', memberDocId), // 'studentId' é usado em api.ts
    limit(1)
  );
  const teamSnap = await getDocs(teamQuery);
  return !teamSnap.empty;
}

/**
 * Endpoint para Opção 1/3: Provisionamento por Token (ID da Equipe + ID do Membro)
 * A extensão envia: { teamId, memberId, url, timestamp, duration }
 */
router.post('/log', async (req, res) => {
  try {
    const { teamId, memberId, url, timestamp, duration } = req.body as LogPayload;

    if (!teamId || !memberId || !url || !timestamp) {
      return res.status(400).json({ success: false, error: 'Dados incompletos.' });
    }

    // 1. Encontrar o membro
    const member = await findMember(memberId);
    if (!member) {
      return res.status(403).json({ success: false, error: 'Membro não registrado (ID do PC/CPF inválido).' });
    }

    // 2. Validar se o membro pertence à equipe (token)
    if (!(await isMemberOfTeam(member.id, teamId))) {
      return res.status(403).json({ success: false, error: 'Membro não pertence a esta equipe (Token de Equipe inválido).' });
    }

    // 3. Classificar e Salvar
    const categoria = await classifyUrl(url);
    const logData = {
      aluno_id: memberId, // O ID (pc_id ou cpf)
      student_name: member.full_name,
      url: url,
      duration: duration || 0,
      categoria: categoria,
      timestamp: Timestamp.fromDate(new Date(timestamp)),
      teamId: teamId, // Armazena a qual equipe este log pertence
    };

    await addDoc(collection(db, 'logs'), logData);
    return res.status(200).json({ success: true, message: 'Log registrado.' });

  } catch (error) {
    console.error('Erro ao registrar log (token):', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
});

/**
 * Endpoint para Opção 2: Login na Extensão
 * A extensão envia: { url, timestamp, duration }
 * e o Token de Auth do *membro* no header Authorization.
 */
router.post('/log_auth', authenticateToken, async (req: any, res) => {
  try {
    const { url, timestamp, duration } = req.body as LogPayload;
    const memberAuthUid = req.user.id; // ID do Firebase Auth do membro

    if (!url || !timestamp) {
      return res.status(400).json({ success: false, error: 'Dados incompletos.' });
    }

    // 1. Encontrar o perfil do membro na coleção 'members'
    // IMPORTANTE: Isso assume que o ID do documento em 'members' é o mesmo UID do Firebase Auth.
    // Se não for, teremos que ajustar (ex: salvar o auth_uid no documento 'members' durante o registro)
    
    // Vamos assumir por agora que o 'memberId' (pc_id/cpf) é o identificador único
    // e que o usuário logado (req.user.email) está no documento 'members'.
    // Esta é a parte mais complexa da Opção 2.
    
    // Simplificação: Vamos assumir que 'memberId' na extensão é o email do usuário logado.
    // O ideal seria que a coleção 'members' tivesse um campo 'auth_uid'.
    // Por ora, vamos usar o email para buscar o 'memberId' (pc_id/cpf).
    
    const memberEmail = req.user.email;
    if (!memberEmail) {
       return res.status(403).json({ success: false, error: 'Token de usuário inválido (sem email).' });
    }

    // A. Encontrar o documento do membro pelo email
    // NOTA: Esta query requer um índice no Firestore em 'email' na coleção 'members'.
    const memberQuery = query(db.collection('members'), where('email', '==', memberEmail), limit(1));
    const memberSnap = await getDocs(memberQuery);
    
    if (memberSnap.empty) {
       return res.status(403).json({ success: false, error: 'Membro (usuário logado) não encontrado no sistema.' });
    }

    const memberDoc = memberSnap.docs[0];
    const member = { id: memberDoc.id, ...memberDoc.data() };
    const memberIdentifier = member.pc_id || member.cpf; // O ID que usamos para os logs

    // B. Encontrar a qual equipe este membro pertence
    const teamMemberRef = db.collection('team_members');
    const teamQuery = query(
      teamMemberRef,
      where('studentId', '==', member.id),
      limit(1)
    );
    const teamSnap = await getDocs(teamQuery);

    if (teamSnap.empty) {
      return res.status(403).json({ success: false, error: 'Membro não está associado a nenhuma equipe.' });
    }
    
    const teamId = teamSnap.docs[0].data().teamId;

    // 3. Classificar e Salvar
    const categoria = await classifyUrl(url);
    const logData = {
      aluno_id: memberIdentifier, // ID (pc_id ou cpf)
      student_name: member.full_name,
      url: url,
      duration: duration || 0,
      categoria: categoria,
      timestamp: Timestamp.fromDate(new Date(timestamp)),
      teamId: teamId, // ID da equipe associada
      auth_uid: memberAuthUid // ID de autenticação
    };

    await addDoc(collection(db, 'logs'), logData);
    return res.status(200).json({ success: true, message: 'Log registrado.' });

  } catch (error) {
    console.error('Erro ao registrar log (auth):', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
});

export default router;