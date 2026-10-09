import { Router } from 'express';
import {
  getMyPayments,
  getPaymentById,
  getPaymentReceipt,
  downloadPaymentPDF,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Student / Current User Payment Routes
router.get('/me', getMyPayments);
router.get('/:id', getPaymentById);
router.get('/:id/receipt', getPaymentReceipt);
router.get('/:id/pdf', downloadPaymentPDF);

export default router;
