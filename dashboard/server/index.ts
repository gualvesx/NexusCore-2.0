import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

// Importar rotas baseadas em Firebase
import authRoutes from './routes/auth'; 
import extensionRoutes from './routes/extension'; 

dotenv.config();

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

// Inicialização do Firebase
if (serviceAccount) {
  // Verifica se já não há um app inicializado para evitar duplicidade em hot-reload
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://banco-vc.firebaseio.com`
    });
    console.log('🔥 Firebase Admin inicializado com sucesso');
  }
} else {
  console.warn('⚠️  Firebase Admin não configurado. Configure FIREBASE_SERVICE_ACCOUNT_KEY no .env');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Logger simples
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas
app.use('/api/auth', authRoutes); // Para login/perfil de Líderes
app.use('/api/ext', extensionRoutes); // Para a extensão enviar logs

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware de Erro Global (CORRIGIDO AQUI)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  // A linha abaixo estava com erro de digitação (5Error)
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
});