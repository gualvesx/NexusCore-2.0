import { Router } from 'express';
import { db } from '../database';
import { authenticateToken } from './auth';

const router = Router();

// Acessos recentes
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const logs = await db.query(
      `SELECT 
        l.url,
        l.categoria as category,
        l.timestamp,
        s.full_name as student_name
       FROM logs l
       LEFT JOIN students s ON (l.aluno_id = s.cpf OR l.aluno_id = s.pc_id)
       ORDER BY l.timestamp DESC
       LIMIT ?`,
      [limit]
    );

    res.json(logs);
  } catch (error) {
    console.error('Erro ao buscar acessos recentes:', error);
    res.status(500).json({ error: 'Erro ao buscar acessos recentes' });
  }
});

// Todos os logs com filtros
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    
    let sql = 'SELECT * FROM logs WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      sql += ' AND timestamp >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND timestamp <= ?';
      params.push(endDate);
    }

    if (category) {
      sql += ' AND categoria = ?';
      params.push(category);
    }

    sql += ' ORDER BY timestamp DESC';

    const logs = await db.query(sql, params);
    res.json(logs);
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
});

export default router;
