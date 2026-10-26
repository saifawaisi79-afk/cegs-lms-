import { Router } from 'express';
import {
  createMentor,
  getMentors,
  getMentorById,
  updateMentor,
  deleteMentor,
  restoreMentor,
  resetMentorPassword,
} from '../controllers/mentorController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createMentorSchema,
  updateMentorSchema,
  removeMentorSchema,
} from '../utils/schemas.js';

const router = Router();

router.use(authenticate);

// Read-only endpoints accessible to authenticated users (candidates, mentors, admins)
router.get('/', getMentors);
router.get('/:id', getMentorById);

// Administrative mutations restricted to Admin
router.post('/', authorize('admin'), validateRequest(createMentorSchema), createMentor);
router.put('/:id', authorize('admin'), validateRequest(updateMentorSchema), updateMentor);
router.delete('/:id', authorize('admin'), validateRequest(removeMentorSchema), deleteMentor);
router.post('/:id/restore', authorize('admin'), restoreMentor);
router.post('/:id/reset-password', authorize('admin'), resetMentorPassword);

export default router;
