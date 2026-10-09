import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  uploadProjectFile,
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema, updateProjectSchema, uploadProjectFileSchema } from '../utils/schemas.js';

const router = Router();

router.use(authenticate);

// Projects
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', authorize('mentor', 'admin'), createProject);
router.put('/:id', validateRequest(updateProjectSchema), updateProject);

// Tasks / Kanban
router.get('/tasks/all', getTasks);
router.post('/tasks', validateRequest(createTaskSchema), createTask);
router.put('/tasks/:id', validateRequest(updateTaskSchema), updateTask);
router.delete('/tasks/:id', deleteTask);

// Files
router.post('/:id/files', validateRequest(uploadProjectFileSchema), uploadProjectFile);

export default router;
