import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

// Importar rotas baseadas em Firebase
import authRoutes from './routes/auth'; 
import extensionRoutes from './routes/extension'; // <-- ADICIONAR ESTA LINHA

// Rotas antigas (baseadas em MySQL, vamos desativá-las)
// import dashboardRoutes from './routes/dashboard';
// import logsRoutes from './routes/logs';
// import studentsRoutes from './routes/students';
// import classesRoutes from './routes/classes';
// import analyticsRoutes from './routes/analytics';

dotenv.config();

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://banco-vc.firebaseio.com` // Adicionar databaseURL se necessário pelo Admin SDK
  });
  console.log('🔥 Firebase Admin inicializado com sucesso');
} else {
  console.warn('⚠️  Firebase Admin não configurado. Configure FIREBASE_SERVICE_ACCOUNT_KEY no .env');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas
app.use('/api/auth', authRoutes); // Para login/perfil de Líderes
app.use('/api/ext', extensionRoutes); // <-- ADICIONAR ESTA LINHA (Para a extensão enviar logs)

/* Desativando rotas legadas do MySQL
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/analytics', analyticsRoutes);
*/

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(5Error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
});