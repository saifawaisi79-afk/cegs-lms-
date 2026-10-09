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

const router = Router();

router.use(authenticate);

// Projects
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', authorize('mentor', 'admin'), createProject);
router.put('/:id', updateProject);

// Tasks / Kanban
router.get('/tasks/all', getTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

// Files
router.post('/:id/files', uploadProjectFile);

export default router;
