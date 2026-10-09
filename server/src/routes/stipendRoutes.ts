import { Router } from 'express';
import {
  getStipends,
  createStipendRecord,
  updateStipendRecord,
} from '../controllers/stipendController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/', getStipends);
router.post('/', authorize('admin'), createStipendRecord);
router.put('/:id', authorize('admin'), updateStipendRecord);

export default router;
