import { Router } from 'express';
import {
  getAdminDashboardStats,
  getAuditLogs,
  getReports,
  globalSearch,
} from '../controllers/adminController.js';
import {
  getAllPaymentsAdmin,
  getAdminPaymentSummary,
  createPaymentAdmin,
  updatePaymentAdmin,
  deletePaymentAdmin,
  getCourseFeeConfig,
  updateCourseFeeConfig,
  getStudentPaymentsAdmin,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Global search is accessible to authenticated users
router.get('/search', globalSearch);

// Admin-only endpoints
router.get('/dashboard-stats', authorize('admin'), getAdminDashboardStats);
router.get('/audit-logs', authorize('admin'), getAuditLogs);
router.get('/reports', authorize('admin'), getReports);

// Admin Payment Management Endpoints
router.get('/payments', authorize('admin'), getAllPaymentsAdmin);
router.get('/payments/summary', authorize('admin'), getAdminPaymentSummary);
router.post('/payments', authorize('admin'), createPaymentAdmin);
router.put('/payments/:id', authorize('admin'), updatePaymentAdmin);
router.delete('/payments/:id', authorize('admin'), deletePaymentAdmin);
router.get('/course-fees', authorize('admin'), getCourseFeeConfig);
router.put('/course-fees', authorize('admin'), updateCourseFeeConfig);
router.get('/students/:studentId/payments', authorize('admin'), getStudentPaymentsAdmin);

export default router;
