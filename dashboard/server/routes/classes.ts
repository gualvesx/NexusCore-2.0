import { Router } from 'express';
import { db } from '../database';
import { authenticateToken } from './auth';

const router = Router();

// Listar todas as turmas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const classes = await db.query(`
      SELECT 
        c.*,
        p.full_name as owner_name,
        COUNT(DISTINCT cs.student_id) as student_count,
        COUNT(DISTINCT cm.professor_id) as professor_count
      FROM classes c
      LEFT JOIN professors p ON c.owner_id = p.id
      LEFT JOIN class_students cs ON c.id = cs.class_id
      LEFT JOIN class_members cm ON c.id = cm.class_id
      GROUP BY c.id
      ORDER BY c.name
    `);
    
    res.json(classes);
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    res.status(500).json({ error: 'Erro ao buscar turmas' });
  }
});

// Buscar turma por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const classes = await db.query(
      'SELECT * FROM classes WHERE id = ?',
      [req.params.id]
    );

    if (classes.length === 0) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    // Buscar estudantes da turma
    const students = await db.query(`
      SELECT s.* FROM students s
      JOIN class_students cs ON s.id = cs.student_id
      WHERE cs.class_id = ?
    `, [req.params.id]);

    // Buscar professores da turma
    const professors = await db.query(`
      SELECT p.* FROM professors p
      JOIN class_members cm ON p.id = cm.professor_id
      WHERE cm.class_id = ?
    `, [req.params.id]);

    res.json({
      ...classes[0],
      students,
      professors
    });
  } catch (error) {
    console.error('Erro ao buscar turma:', error);
    res.status(500).json({ error: 'Erro ao buscar turma' });
  }
});

// Criar nova turma
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { name } = req.body;
    const owner_id = req.user.id;

    const result = await db.query(
      'INSERT INTO classes (name, owner_id) VALUES (?, ?)',
      [name, owner_id]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      owner_id
    });
  } catch (error) {
    console.error('Erro ao criar turma:', error);
    res.status(500).json({ error: 'Erro ao criar turma' });
  }
});

// Atualizar turma
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    await db.query(
      'UPDATE classes SET name = ? WHERE id = ?',
      [name, req.params.id]
    );

    res.json({ message: 'Turma atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
    res.status(500).json({ error: 'Erro ao atualizar turma' });
  }
});

// Deletar turma
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM classes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Turma deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar turma:', error);
    res.status(500).json({ error: 'Erro ao deletar turma' });
  }
});

// Adicionar estudante à turma
router.post('/:id/students/:studentId', authenticateToken, async (req, res) => {
  try {
    await db.query(
      'INSERT INTO class_students (class_id, student_id) VALUES (?, ?)',
      [req.params.id, req.params.studentId]
    );

    res.json({ message: 'Estudante adicionado à turma' });
  } catch (error) {
    console.error('Erro ao adicionar estudante:', error);
    res.status(500).json({ error: 'Erro ao adicionar estudante' });
  }
});

// Remover estudante da turma
router.delete('/:id/students/:studentId', authenticateToken, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM class_students WHERE class_id = ? AND student_id = ?',
      [req.params.id, req.params.studentId]
    );

    res.json({ message: 'Estudante removido da turma' });
  } catch (error) {
    console.error('Erro ao remover estudante:', error);
    res.status(500).json({ error: 'Erro ao remover estudante' });
  }
});

export default router;
