import { Request, Response } from 'express';
import { Project, Task, ProjectFile } from '../models/Project.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';

// PROJECTS
export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { trackId } = req.query;
    const query: any = {};
    if (trackId) query.track = trackId;

    if (req.user?.role === 'student') {
      // Find projects where student is a team member, or all projects in their track
      query.$or = [{ teamMembers: req.user._id }];
    }

    let projects = await Project.find(query)
      .populate('teamMembers', 'name email avatar')
      .populate('track');

    // If student has no assigned team project yet, fetch track's general capstone projects
    if (projects.length === 0) {
      projects = await Project.find().populate('teamMembers', 'name email avatar').populate('track');
    }

    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('teamMembers', 'name email avatar')
      .populate('track');

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    const tasks = await Task.find({ project: project._id }).populate('assignedTo', 'name email avatar');
    const files = await ProjectFile.find({ project: project._id }).populate('uploadedBy', 'name');

    res.status(200).json({
      success: true,
      data: {
        project,
        tasks,
        files,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.create(req.body);
    await logAuditEvent(req, 'CREATE_PROJECT', 'PROJECTS', project._id.toString(), req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projectId = req.params.id as string;
    const project = await Project.findByIdAndUpdate(projectId, req.body, { new: true });
    await logAuditEvent(req, 'UPDATE_PROJECT', 'PROJECTS', projectId, req.body);
    res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// TASKS & KANBAN
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, assignedTo } = req.query;
    const query: any = {};
    if (projectId) query.project = projectId;
    if (assignedTo) query.assignedTo = assignedTo;

    const tasks = await Task.find(query).populate('assignedTo', 'name email avatar');
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.create({
      ...req.body,
      assignedTo: req.body.assignedTo || req.user?._id,
    });
    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updateData = { ...req.body };
    if (req.body.status === 'COMPLETED' && !req.body.completedAt) {
      updateData.completedAt = new Date();
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Task deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PROJECT FILES
export const uploadProjectFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, name, fileUrl, fileType, sizeBytes } = req.body;
    const file = await ProjectFile.create({
      project: projectId,
      name,
      fileUrl,
      fileType: fileType || 'application/pdf',
      sizeBytes: sizeBytes || 102400,
      uploadedBy: req.user?._id,
    });
    res.status(201).json({ success: true, data: file });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
