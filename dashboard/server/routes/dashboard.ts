import { Router } from 'express';
import { db } from '../database';
import { authenticateToken } from './auth';

const router = Router();

// Dashboard Stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Total de usuários (estudantes)
    const [totalUsersResult] = await db.query('SELECT COUNT(*) as count FROM students');
    const totalUsers = totalUsersResult.count;

    // Total de alertas (logs com categoria "Rede Social" ou outras não produtivas)
    const [alertsResult] = await db.query(
      `SELECT COUNT(*) as count FROM logs 
       WHERE categoria IN ('Rede Social', 'Streaming & Jogos', 'Outros')`
    );
    const totalAlerts = alertsResult.count;

    // Detecções de IA
    const [aiResult] = await db.query(
      `SELECT COUNT(*) as count FROM logs WHERE categoria = 'IA'`
    );
    const aiDetections = aiResult.count;

    // Total de logs
    const [logsResult] = await db.query('SELECT COUNT(*) as count FROM logs');
    const totalLogs = logsResult.count;

    res.json({
      totalUsers,
      totalAlerts,
      aiDetections,
      totalLogs
    });
  } catch (error) {
    console.error('Erro ao buscar stats:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

export default router;
