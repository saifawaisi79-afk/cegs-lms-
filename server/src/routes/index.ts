import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './authRoutes.js';
import studentRoutes from './studentRoutes.js';
import curriculumRoutes from './curriculumRoutes.js';
import assessmentRoutes from './assessmentRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import mentorshipRoutes from './mentorshipRoutes.js';
import projectRoutes from './projectRoutes.js';
import placementRoutes from './placementRoutes.js';
import certificateRoutes from './certificateRoutes.js';
import stipendRoutes from './stipendRoutes.js';
import communicationRoutes from './communicationRoutes.js';
import adminRoutes from './adminRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import receiptRoutes from './receiptRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/curriculum', curriculumRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/mentorship', mentorshipRoutes);
router.use('/projects', projectRoutes);
router.use('/placement', placementRoutes);
router.use('/certificates', certificateRoutes);
router.use('/stipends', stipendRoutes);
router.use('/payments', paymentRoutes);
router.use('/receipts', receiptRoutes);
router.use('/communication', communicationRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const status = isConnected ? 'healthy' : 'error';
  const statusCode = isConnected ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    database: isConnected ? 'connected' : 'disconnected',
  });
});

export default router;
