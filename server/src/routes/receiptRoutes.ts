import { Router } from 'express';
import {
  verifyReceiptPublic,
  getReceiptByNumber,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public verification endpoint
router.get('/:receiptNumber/verify', verifyReceiptPublic);

// Authenticated receipt lookup
router.get('/:receiptNumber', authenticate, getReceiptByNumber);

export default router;
