import { Router } from 'express';
import userController from '../controllers/userController';
import { verifyFirebaseToken } from '../middlewares/auth';

const router = Router();

// POST /api/users/sync - Sincronizar usuário (não requer auth pois é chamado no registro)
router.post('/sync', userController.syncUser);

// Todas as rotas abaixo requerem autenticação
router.use(verifyFirebaseToken);

// GET /api/users/:userId - Buscar perfil
router.get('/:userId', userController.getProfile);

// PUT /api/users/:userId - Atualizar perfil
router.put('/:userId', userController.updateProfile);

// DELETE /api/users/:userId - Deletar conta
router.delete('/:userId', userController.deleteAccount);

export default router;

