import { Router } from 'express';
import { db } from '../database';
import { authenticateToken } from './auth';

const router = Router();

// Breakdown por categoria
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await db.query(`
      SELECT 
        categoria as category,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM logs), 2) as percentage
      FROM logs
      WHERE categoria IS NOT NULL
      GROUP BY categoria
      ORDER BY count DESC
    `);

    res.json(categories);
  } catch (error) {
    console.error('Erro ao buscar breakdown por categoria:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Atividade por hora
router.get('/by-hour', authenticateToken, async (req, res) => {
  try {
    const hourly = await db.query(`
      SELECT 
        HOUR(timestamp) as hour,
        COUNT(*) as count
      FROM logs
      GROUP BY HOUR(timestamp)
      ORDER BY hour
    `);

    res.json(hourly);
  } catch (error) {
    console.error('Erro ao buscar atividade por hora:', error);
    res.status(500).json({ error: 'Erro ao buscar atividade por hora' });
  }
});

// Atividade por dia da semana
router.get('/by-weekday', authenticateToken, async (req, res) => {
  try {
    const weekday = await db.query(`
      SELECT 
        DAYOFWEEK(timestamp) as day,
        COUNT(*) as count
      FROM logs
      GROUP BY DAYOFWEEK(timestamp)
      ORDER BY day
    `);

    res.json(weekday);
  } catch (error) {
    console.error('Erro ao buscar atividade por dia:', error);
    res.status(500).json({ error: 'Erro ao buscar atividade por dia' });
  }
});

// Top sites acessados
router.get('/top-sites', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const sites = await db.query(`
      SELECT 
        url,
        COUNT(*) as access_count,
        SUM(duration) as total_duration,
        categoria as category
      FROM logs
      GROUP BY url, categoria
      ORDER BY access_count DESC
      LIMIT ?
    `, [limit]);

    res.json(sites);
  } catch (error) {
    console.error('Erro ao buscar top sites:', error);
    res.status(500).json({ error: 'Erro ao buscar top sites' });
  }
});

export default router;
