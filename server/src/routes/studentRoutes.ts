import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  getStudentFullProfile,
  createStudent,
  updateStudent,
  saveOnboarding,
  getStudentDashboardData,
} from '../controllers/studentController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Aggregated Dashboard for logged-in student
router.get('/me/dashboard', getStudentDashboardData);
router.get('/dashboard/me', getStudentDashboardData);

router.get('/', authorize('mentor', 'admin'), getStudents);
router.post('/', authorize('admin'), createStudent);
router.post('/onboarding', saveOnboarding);
router.get('/:id', getStudentById);
router.get('/:id/full-profile', authorize('mentor', 'admin'), getStudentFullProfile);
router.put('/:id', updateStudent);

export default router;
