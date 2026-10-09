import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User.js';
import { StudentProfile } from '../models/Profiles.js';
import { ENV } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';

const generateToken = (id: string, role: UserRole): string => {
  return jwt.sign({ id, role }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
      return;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    // Fetch student profile if student
    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await StudentProfile.findOne({ user: user._id }).populate('track batch assignedMentor');
    }

    await logAuditEvent(
      { user, ip: req.ip, socket: req.socket, get: req.get.bind(req) } as any,
      'USER_LOGIN',
      'AUTH',
      user._id.toString(),
      { email: user.email, role: user.role }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isFirstLogin: user.isFirstLogin,
        studentProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    let studentProfile = null;
    if (req.user.role === 'student') {
      studentProfile = await StudentProfile.findOne({ user: req.user._id }).populate('track batch assignedMentor');
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        isFirstLogin: req.user.isFirstLogin,
        studentProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  // For security, always return success message even if not found
  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, password reset instructions have been sent.',
  });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({ success: true, message: 'Password has been successfully updated.' });
};
