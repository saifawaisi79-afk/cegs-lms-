import { Router } from 'express';
import {
  login,
  refresh,
  changePassword,
  getMe,
  logout,
  logoutAll,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import {
  loginFailedAttemptLimiter,
  ipFailedAttemptLimiter,
} from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', ipFailedAttemptLimiter, loginFailedAttemptLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/logout-all', authenticate, logoutAll);
router.post('/change-password', authenticate, changePassword);
router.get('/me', authenticate, getMe);

export default router;
