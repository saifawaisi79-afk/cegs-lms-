import { Router } from 'express';
import {
  getSessions,
  createSession,
  updateSession,
  getSWOTReviews,
  saveSWOTReview,
  getMockInterviews,
  createMockInterview,
  updateMockInterview,
  getMentorDashboardData,
} from '../controllers/mentorshipController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Mentor Dashboard KPIs & Candidate Roster
router.get('/mentor/dashboard', authorize('mentor', 'admin'), getMentorDashboardData);

// Sessions
router.get('/sessions', getSessions);
router.post('/sessions', createSession);
router.put('/sessions/:id', authorize('mentor', 'admin'), updateSession);

// SWOT
router.get('/swot/:studentId', getSWOTReviews);
router.post('/swot', authorize('mentor', 'admin'), saveSWOTReview);

// Mock Interviews
router.get('/mock-interviews', getMockInterviews);
router.post('/mock-interviews', authorize('mentor', 'admin'), createMockInterview);
router.put('/mock-interviews/:id', authorize('mentor', 'admin'), updateMockInterview);

export default router;
