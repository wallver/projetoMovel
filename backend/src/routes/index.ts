import { Router } from 'express';
import userRoutes from './userRoutes';
import billRoutes from './billRoutes';
import notificationRoutes from './notificationRoutes';

const router = Router();

// Registrar rotas
router.use('/users', userRoutes);
router.use('/bills', billRoutes);
router.use('/notifications', notificationRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;

