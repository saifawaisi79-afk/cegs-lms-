import { Router } from 'express';
import {
  getAttendance,
  getMyAttendance,
  markAttendance,
  markBatchAttendance,
} from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import { markAttendanceSchema } from '../utils/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/me', getMyAttendance);
router.get('/', authorize('mentor', 'admin'), getAttendance);
router.post('/', validateRequest(markAttendanceSchema), markAttendance);
router.post('/batch', authorize('mentor', 'admin'), markBatchAttendance);

export default router;
