import { Request, Response } from 'express';
import { Program, Track, Batch, Module, Lesson } from '../models/Curriculum.js';
import { LessonProgress } from '../models/LearningProgress.js';
import { StudentProfile } from '../models/Profiles.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';

// PROGRAMS
export const getPrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    const programs = await Program.find();
    res.status(200).json({ success: true, data: programs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProgram = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const program = await Program.create(req.body);
    await logAuditEvent(req, 'CREATE_PROGRAM', 'CURRICULUM', program._id.toString(), req.body);
    res.status(201).json({ success: true, data: program });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// TRACKS
export const getTracks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tracks = await Track.find({ isActive: true });
    res.status(200).json({ success: true, data: tracks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTrackById = async (req: Request, res: Response): Promise<void> => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      res.status(404).json({ success: false, message: 'Track not found.' });
      return;
    }
    res.status(200).json({ success: true, data: track });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const track = await Track.create(req.body);
    await logAuditEvent(req, 'CREATE_TRACK', 'CURRICULUM', track._id.toString(), req.body);
    res.status(201).json({ success: true, data: track });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trackId = req.params.id as string;
    const track = await Track.findByIdAndUpdate(trackId, req.body, { new: true });
    await logAuditEvent(req, 'UPDATE_TRACK', 'CURRICULUM', trackId, req.body);
    res.status(200).json({ success: true, data: track });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// BATCHES
export const getBatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const batches = await Batch.find()
      .populate('program')
      .populate('students', 'name email avatar')
      .populate('mentors', 'name email avatar');
    res.status(200).json({ success: true, data: batches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const batch = await Batch.create(req.body);
    await logAuditEvent(req, 'CREATE_BATCH', 'CURRICULUM', batch._id.toString(), req.body);
    res.status(201).json({ success: true, data: batch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULES & LESSONS
export const getModules = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trackId, monthNumber, weekNumber } = req.query;
    const query: any = {};

    if (trackId) {
      // Return modules specific to track OR shared modules (track: null)
      query.$or = [{ track: trackId }, { track: null }];
    }
    if (monthNumber) query.monthNumber = Number(monthNumber);
    if (weekNumber) query.weekNumber = Number(weekNumber);

    const modules = await Module.find(query).sort({ monthNumber: 1, weekNumber: 1, order: 1 });
    const moduleIds = modules.map((m) => m._id);

    const lessons = await Lesson.find({ module: { $in: moduleIds } }).sort({ order: 1 });

    const modulesWithLessons = modules.map((mod) => {
      const modLessons = lessons.filter((l) => l.module.toString() === mod._id.toString());
      return {
        ...mod.toObject(),
        lessons: modLessons,
      };
    });

    res.status(200).json({ success: true, data: modulesWithLessons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const module = await Module.create(req.body);
    await logAuditEvent(req, 'CREATE_MODULE', 'CURRICULUM', module._id.toString(), req.body);
    res.status(201).json({ success: true, data: module });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLessons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.query;
    const query: any = {};
    if (moduleId) query.module = moduleId;

    const lessons = await Lesson.find(query).sort({ order: 1 });
    res.status(200).json({ success: true, data: lessons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLessonById = async (req: Request, res: Response): Promise<void> => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('module');
    if (!lesson) {
      res.status(404).json({ success: false, message: 'Lesson not found.' });
      return;
    }
    res.status(200).json({ success: true, data: lesson });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lesson = await Lesson.create(req.body);
    await logAuditEvent(req, 'CREATE_LESSON', 'CURRICULUM', lesson._id.toString(), req.body);
    res.status(201).json({ success: true, data: lesson });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lessonId = req.params.id as string;
    const lesson = await Lesson.findByIdAndUpdate(lessonId, req.body, { new: true });
    await logAuditEvent(req, 'UPDATE_LESSON', 'CURRICULUM', lessonId, req.body);
    res.status(200).json({ success: true, data: lesson });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// LESSON PROGRESS
export const getMyProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const progressRecords = await LessonProgress.find({ student: req.user._id }).populate({
      path: 'lesson',
      populate: { path: 'module' },
    });

    const completedLessonIds = progressRecords.filter((p) => p.completed).map((p) => p.lesson._id);
    const bookmarkedLessons = progressRecords.filter((p) => p.bookmarked);

    res.status(200).json({
      success: true,
      data: {
        records: progressRecords,
        completedLessonIds,
        bookmarkedLessons,
        totalCompleted: completedLessonIds.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleLessonComplete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { lessonId, moduleId } = req.body;
    let progress = await LessonProgress.findOne({ student: req.user._id, lesson: lessonId });

    if (!progress) {
      progress = new LessonProgress({
        student: req.user._id,
        lesson: lessonId,
        module: moduleId,
        completed: true,
        completedAt: new Date(),
      });
    } else {
      progress.completed = !progress.completed;
      progress.completedAt = progress.completed ? new Date() : undefined;
    }

    await progress.save();

    // Update student overall progress percentage
    const totalLessons = await Lesson.countDocuments();
    const completedCount = await LessonProgress.countDocuments({
      student: req.user._id,
      completed: true,
    });

    const percentage = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;
    await StudentProfile.findOneAndUpdate({ user: req.user._id }, { overallProgress: percentage });

    res.status(200).json({ success: true, data: progress, overallProgress: percentage });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleLessonBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { lessonId, moduleId } = req.body;
    let progress = await LessonProgress.findOne({ student: req.user._id, lesson: lessonId });

    if (!progress) {
      progress = new LessonProgress({
        student: req.user._id,
        lesson: lessonId,
        module: moduleId,
        bookmarked: true,
      });
    } else {
      progress.bookmarked = !progress.bookmarked;
    }

    await progress.save();
    res.status(200).json({ success: true, data: progress });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveLessonNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { lessonId, moduleId, notes } = req.body;
    let progress = await LessonProgress.findOne({ student: req.user._id, lesson: lessonId });

    if (!progress) {
      progress = new LessonProgress({
        student: req.user._id,
        lesson: lessonId,
        module: moduleId,
        notes,
      });
    } else {
      progress.notes = notes;
    }

    await progress.save();
    res.status(200).json({ success: true, data: progress });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
