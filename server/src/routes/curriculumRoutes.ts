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
  updateModule,
  deleteModule,
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getMyProgress,
  toggleLessonComplete,
  toggleLessonBookmark,
  saveLessonNotes,
} from '../controllers/curriculumController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = Router();

// Device file upload (video & documents) for Mentors & Admins
router.post(
  '/upload',
  authenticate,
  authorize('mentor', 'admin'),
  uploadMiddleware.single('file'),
  (req: any, res: any) => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file received from device.' });
        return;
      }
      const isVideo =
        req.file.mimetype.startsWith('video/') ||
        /\.(mp4|webm|mov|mkv|avi|ogg)$/i.test(req.file.originalname);
      const subFolder = isVideo ? 'videos' : 'documents';
      const fileUrl = `/uploads/${subFolder}/${req.file.filename}`;
      res.status(200).json({
        success: true,
        data: {
          fileUrl,
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          sizeBytes: req.file.size,
          isVideo,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// Authenticated reading
router.get('/programs', authenticate, getPrograms);
router.get('/tracks', authenticate, getTracks);
router.get('/tracks/:id', authenticate, getTrackById);
router.get('/batches', authenticate, getBatches);
router.get('/modules', authenticate, getModules);
router.get('/lessons', authenticate, getLessons);
router.get('/lessons/:id', authenticate, getLessonById);

// Progress routes (student)
router.get('/progress/me', authenticate, getMyProgress);
router.post('/progress/toggle-complete', authenticate, toggleLessonComplete);
router.post('/progress/toggle-bookmark', authenticate, toggleLessonBookmark);
router.post('/progress/notes', authenticate, saveLessonNotes);

// Program, Track & Batch management (Admin)
router.post('/programs', authenticate, authorize('admin'), createProgram);
router.post('/tracks', authenticate, authorize('admin'), createTrack);
router.put('/tracks/:id', authenticate, authorize('admin'), updateTrack);
router.post('/batches', authenticate, authorize('admin'), createBatch);

// Learning / Curriculum content management (Mentor & Admin)
router.post('/modules', authenticate, authorize('mentor', 'admin'), createModule);
router.put('/modules/:id', authenticate, authorize('mentor', 'admin'), updateModule);
router.delete('/modules/:id', authenticate, authorize('mentor', 'admin'), deleteModule);

router.post('/lessons', authenticate, authorize('mentor', 'admin'), createLesson);
router.put('/lessons/:id', authenticate, authorize('mentor', 'admin'), updateLesson);
router.delete('/lessons/:id', authenticate, authorize('mentor', 'admin'), deleteLesson);

export default router;
