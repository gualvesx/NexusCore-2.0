# Integração com Backend MySQL

## Configuração

1. Configure a variável de ambiente `VITE_API_URL` no arquivo `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

## Endpoints Necessários

Crie estes endpoints no seu backend Node.js/PHP/Python conectado ao MySQL:

### Dashboard Stats
```
GET /api/dashboard/stats
Response: {
  totalUsers: number,
  totalAlerts: number,
  aiDetections: number,
  totalLogs: number
}
```

### Recent Access
```
GET /api/logs/recent?limit=10
Response: [{
  url: string,
  category: string,
  timestamp: string,
  student_name: string
}]
```

### Logs
```
GET /api/logs?startDate=&endDate=&category=
Response: Log[]
```

### Students
```
GET /api/students
GET /api/students/:id
```

### Classes
```
GET /api/classes
GET /api/classes/:id
```

### Professors
```
GET /api/professors
GET /api/professors/:id
```

### Analytics
```
GET /api/analytics/categories
Response: [{ category: string, count: number, percentage: number }]

GET /api/analytics/by-hour
Response: [{ hour: number, count: number }]
```

## Exemplo de Backend (Node.js + Express + MySQL)

```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'v_o_c_e',
  waitForConnections: true,
  connectionLimit: 10,
});

// Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [students] = await pool.query('SELECT COUNT(*) as count FROM students');
    const [logs] = await pool.query('SELECT COUNT(*) as count FROM logs');
    const [aiLogs] = await pool.query('SELECT COUNT(*) as count FROM logs WHERE categoria = "IA"');
    const [alerts] = await pool.query('SELECT COUNT(*) as count FROM logs WHERE categoria IN ("Rede Social", "Streaming & Jogos")');

    res.json({
      totalUsers: students[0].count,
      totalLogs: logs[0].count,
      aiDetections: aiLogs[0].count,
      totalAlerts: alerts[0].count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recent Access
app.get('/api/logs/recent', async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const [rows] = await pool.query(`
      SELECT l.url, l.categoria as category, l.timestamp, s.full_name as student_name
      FROM logs l
      LEFT JOIN students s ON l.aluno_id = s.cpf OR l.aluno_id = s.pc_id
      ORDER BY l.timestamp DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('API rodando na porta 3000');
});
```

## Como Usar

1. Os dados atualmente são mockados para desenvolvimento
2. Quando seu backend estiver pronto, os hooks React Query automaticamente buscarão dados reais
3. Não é necessário modificar os componentes, apenas certifique-se de que o backend retorna os dados no formato esperado
