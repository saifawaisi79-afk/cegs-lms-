import { Router } from 'express';
import {
  getPrograms,
  createProgram,
  getTracks,
  getTrackById,
  createTrack,
  updateTrack,
  getBatches,
  createBatch,
  getModules,
  createModule,
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  getMyProgress,
  toggleLessonComplete,
  toggleLessonBookmark,
  saveLessonNotes,
} from '../controllers/curriculumController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// Public/Authenticated reading
router.get('/programs', getPrograms);
router.get('/tracks', getTracks);
router.get('/tracks/:id', getTrackById);
router.get('/batches', getBatches);
router.get('/modules', getModules);
router.get('/lessons', getLessons);
router.get('/lessons/:id', getLessonById);

// Progress routes (student)
router.get('/progress/me', authenticate, getMyProgress);
router.post('/progress/toggle-complete', authenticate, toggleLessonComplete);
router.post('/progress/toggle-bookmark', authenticate, toggleLessonBookmark);
router.post('/progress/notes', authenticate, saveLessonNotes);

// Admin Curriculum management
router.post('/programs', authenticate, authorize('admin'), createProgram);
router.post('/tracks', authenticate, authorize('admin'), createTrack);
router.put('/tracks/:id', authenticate, authorize('admin'), updateTrack);
router.post('/batches', authenticate, authorize('admin'), createBatch);
router.post('/modules', authenticate, authorize('admin'), createModule);
router.post('/lessons', authenticate, authorize('admin'), createLesson);
router.put('/lessons/:id', authenticate, authorize('admin'), updateLesson);

export default router;
