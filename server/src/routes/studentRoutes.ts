import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  getStudentFullProfile,
  createStudent,
  bulkCreateStudents,
  updateStudent,
  deleteStudent,
  restoreStudent,
  resetStudentPassword,
  reassignStudent,
  saveOnboarding,
  getStudentDashboardData,
} from '../controllers/studentController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createStudentSchema,
  bulkStudentSchema,
  updateStudentSchema,
  reassignStudentSchema,
} from '../utils/schemas.js';

const router = Router();

router.use(authenticate);

// Aggregated Dashboard for logged-in student
router.get('/me/dashboard', getStudentDashboardData);
router.get('/dashboard/me', getStudentDashboardData);

// Candidate / Student CRUD & Management
router.get('/', getStudents);
router.post('/', authorize('mentor', 'admin'), validateRequest(createStudentSchema), createStudent);
router.post('/bulk', authorize('mentor', 'admin'), bulkCreateStudents);
router.post('/onboarding', saveOnboarding);

router.get('/:id', getStudentById);
router.get('/:id/full-profile', getStudentFullProfile);
router.put('/:id', validateRequest(updateStudentSchema), updateStudent);
router.delete('/:id', authorize('mentor', 'admin'), deleteStudent);
router.post('/:id/restore', authorize('mentor', 'admin'), restoreStudent);
router.post('/:id/reset-password', authorize('mentor', 'admin'), resetStudentPassword);
router.put('/:id/reassign', authorize('admin'), validateRequest(reassignStudentSchema), reassignStudent);

export default router;
