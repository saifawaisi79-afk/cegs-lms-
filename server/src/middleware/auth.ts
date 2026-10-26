import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { User, IUser, UserRole } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface AccessTokenPayload {
  sub: string;
  uid: string;
  role: UserRole;
  tv: number;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication token required. Please sign in.',
      });
      return;
    }

    let decoded: AccessTokenPayload;
    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'cegs-lms',
        audience: 'cegs-client',
      }) as AccessTokenPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Access token expired.',
        });
        return;
      }
      res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.',
      });
      return;
    }

    // Load user without password hash (password is select: false by default)
    const user = await User.findById(decoded.sub);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
      return;
    }

    if (!user.isActive || user.removedAt) {
      res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact support.',
      });
      return;
    }

    if (decoded.tv !== user.tokenVersion) {
      res.status(401).json({
        success: false,
        message: 'Session invalidated. Please log in again.',
      });
      return;
    }

    if (user.passwordChangedAt && decoded.iat && decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
      res.status(401).json({
        success: false,
        message: 'Password recently changed. Please log in again.',
      });
      return;
    }

    // Force password change check
    if (user.mustChangePassword) {
      const originalPath = (req.originalUrl || req.path).split('?')[0];
      const isExempt =
        originalPath.endsWith('/auth/change-password') ||
        originalPath.endsWith('/auth/me') ||
        originalPath.endsWith('/auth/logout') ||
        originalPath.endsWith('/auth/refresh');

      if (!isExempt) {
        res.status(403).json({
          success: false,
          code: 'PASSWORD_CHANGE_REQUIRED',
          message: 'Password change required before accessing other resources.',
        });
        return;
      }
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};
