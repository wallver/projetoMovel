import { Router } from 'express';
import notificationController from '../controllers/notificationController';
import { verifyFirebaseToken } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(verifyFirebaseToken);

// GET /api/notifications/:userId - Listar notificações
router.get('/:userId', notificationController.listNotifications);

// GET /api/notifications/:userId/unread-count - Contar não lidas
router.get('/:userId/unread-count', notificationController.countUnread);

// PUT /api/notifications/:notificationId/read - Marcar como lida
router.put('/:notificationId/read', notificationController.markAsRead);

// PUT /api/notifications/:userId/read-all - Marcar todas como lidas
router.put('/:userId/read-all', notificationController.markAllAsRead);

export default router;

