import { Router } from 'express';
import { db } from '../database';
import { authenticateToken } from './auth';

const router = Router();

// Listar todos os estudantes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const students = await db.query('SELECT * FROM students ORDER BY full_name');
    res.json(students);
  } catch (error) {
    console.error('Erro ao buscar estudantes:', error);
    res.status(500).json({ error: 'Erro ao buscar estudantes' });
  }
});

// Buscar estudante por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const students = await db.query(
      'SELECT * FROM students WHERE id = ?',
      [req.params.id]
    );

    if (students.length === 0) {
      return res.status(404).json({ error: 'Estudante não encontrado' });
    }

    res.json(students[0]);
  } catch (error) {
    console.error('Erro ao buscar estudante:', error);
    res.status(500).json({ error: 'Erro ao buscar estudante' });
  }
});

// Criar novo estudante
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { full_name, cpf, pc_id } = req.body;

    const result = await db.query(
      'INSERT INTO students (full_name, cpf, pc_id) VALUES (?, ?, ?)',
      [full_name, cpf || null, pc_id || null]
    );

    res.status(201).json({
      id: result.insertId,
      full_name,
      cpf,
      pc_id
    });
  } catch (error) {
    console.error('Erro ao criar estudante:', error);
    res.status(500).json({ error: 'Erro ao criar estudante' });
  }
});

// Atualizar estudante
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { full_name, cpf, pc_id } = req.body;

    await db.query(
      'UPDATE students SET full_name = ?, cpf = ?, pc_id = ? WHERE id = ?',
      [full_name, cpf || null, pc_id || null, req.params.id]
    );

    res.json({ message: 'Estudante atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar estudante:', error);
    res.status(500).json({ error: 'Erro ao atualizar estudante' });
  }
});

// Deletar estudante
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ message: 'Estudante deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar estudante:', error);
    res.status(500).json({ error: 'Erro ao deletar estudante' });
  }
});

export default router;
