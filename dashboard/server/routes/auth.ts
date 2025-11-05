import { Router } from 'express';
import admin from 'firebase-admin';

const router = Router();

// Middleware de autenticação com Firebase Admin SDK
export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name
    };
    next();
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Obter perfil do usuário autenticado (busca dados do Firebase)
router.get('/profile', authenticateToken, async (req: any, res) => {
  try {
    const userRecord = await admin.auth().getUser(req.user.id);
    
    res.json({
      id: userRecord.uid,
      email: userRecord.email,
      full_name: userRecord.displayName || '',
      username: userRecord.email?.split('@')[0] || ''
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

export default router;
