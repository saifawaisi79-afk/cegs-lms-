import { Router } from 'express';
import {
  getCertificates,
  getCertificateById,
  verifyCertificate,
  issueCertificate,
} from '../controllers/certificateController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// PUBLIC verification route
router.get('/verify/:certificateId', verifyCertificate);

// Protected routes
router.get('/', authenticate, getCertificates);
router.get('/:id', authenticate, getCertificateById);
router.post('/', authenticate, authorize('admin'), issueCertificate);

export default router;
