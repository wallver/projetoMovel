import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import './jobs/reminderJob'; // Importar cron job

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de log
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Registrar rotas
app.use('/api', routes);

// Rota 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Middleware de erro
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Erro:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno',
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log(`📱 Servidor Bill Reminder rodando!`);
  console.log(`🔗 Porta: ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`⏰ Cron jobs iniciados`);
  console.log('========================================\n');
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Encerrando servidor...');
  
  server.close(async () => {
    console.log('✅ Servidor HTTP encerrado');
    console.log('✅ Firestore connection will be closed automatically');
    
    process.exit(0);
  });

  // Forçar encerramento após 10 segundos
  setTimeout(() => {
    console.error('⚠️ Forçando encerramento...');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

export default app;

