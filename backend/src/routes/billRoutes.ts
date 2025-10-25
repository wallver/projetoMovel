import { Router } from 'express';
import multer from 'multer';
import billController from '../controllers/billController';
import { verifyFirebaseToken } from '../middlewares/auth';

const router = Router();

// Configurar multer para upload de imagens (memória)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB (aumentado para imagens de alta qualidade)
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  },
});

// Todas as rotas requerem autenticação
router.use(verifyFirebaseToken);

// POST /api/bills/upload - Upload e processamento de conta
router.post('/upload', upload.single('image'), billController.uploadBill);

// GET /api/bills/:userId - Listar contas do usuário
router.get('/:userId', billController.listBills);

// GET /api/bills/:userId/stats - Estatísticas do usuário
router.get('/:userId/stats', billController.getStats);

// GET /api/bills/detail/:billId - Buscar conta por ID
router.get('/detail/:billId', billController.getBill);

// PUT /api/bills/:billId - Atualizar conta
router.put('/:billId', billController.updateBill);

// POST /api/bills/:billId/pay - Marcar conta como paga
router.post('/:billId/pay', billController.markAsPaid);

// DELETE /api/bills/:billId - Deletar conta
router.delete('/:billId', billController.deleteBill);

export default router;

