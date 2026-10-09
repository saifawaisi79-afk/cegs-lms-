import { Router } from 'express';
import {
  getAssessments,
  getAssessmentById,
  createAssessment,
  submitAssessment,
  getStudentAssessmentAnalytics,
} from '../controllers/assessmentController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/', getAssessments);
router.get('/analytics/student', getStudentAssessmentAnalytics);
router.get('/analytics/student/:studentId', authorize('mentor', 'admin'), getStudentAssessmentAnalytics);
router.get('/:id', getAssessmentById);
router.post('/', authorize('mentor', 'admin'), createAssessment);
router.post('/:id/submit', submitAssessment);

export default router;
