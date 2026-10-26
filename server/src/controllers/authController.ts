import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, IUser, UserRole } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { StudentProfile, MentorProfile } from '../models/Profiles.js';
import { ENV } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { normalizeLoginIdentifier } from '../middleware/rateLimiter.js';
import { validateNewPassword } from '../services/passwordService.js';

const DUMMY_BCRYPT_HASH = '$2a$12$e8uqgXhW0yQ4m0G7qH5MquqF6Kx0.cK2pM9lqL0Lq0Lq0Lq0Lq0Lq';

function checkOriginAllowed(req: Request): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;
  const allowed = [ENV.CLIENT_URL];
  if (ENV.NODE_ENV !== 'production') {
    if (!allowed.includes('http://localhost:5173')) allowed.push('http://localhost:5173');
    if (!allowed.includes('http://127.0.0.1:5173')) allowed.push('http://127.0.0.1:5173');
  }
  return allowed.includes(origin);
}

export function generateAccessToken(user: IUser): string {
  return jwt.sign(
    {
      sub: user._id.toString(),
      uid: user.userId || '',
      role: user.role,
      tv: user.tokenVersion || 0,
    },
    ENV.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: ENV.JWT_ACCESS_EXPIRES_IN as any,
      issuer: 'cegs-lms',
      audience: 'cegs-client',
    }
  );
}

export function generateRefreshTokenJwt(jti: string, userId: string, familyId: string): string {
  return jwt.sign(
    {
      jti,
      sub: userId,
      familyId,
    },
    ENV.JWT_REFRESH_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any,
      issuer: 'cegs-lms',
      audience: 'cegs-client',
    }
  );
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  const isProduction = ENV.NODE_ENV === 'production';
  res.cookie('cegs_rt', token, {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE !== undefined ? ENV.COOKIE_SECURE : isProduction,
    sameSite: (ENV.COOKIE_SAMESITE as 'lax' | 'strict' | 'none') || 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  const isProduction = ENV.NODE_ENV === 'production';
  res.clearCookie('cegs_rt', {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE !== undefined ? ENV.COOKIE_SECURE : isProduction,
    sameSite: (ENV.COOKIE_SAMESITE as 'lax' | 'strict' | 'none') || 'lax',
    path: '/api/auth',
  });
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawIdentifier = req.body.identifier || req.body.email;
    const password = req.body.password;

    if (!rawIdentifier || !password) {
      res.status(400).json({ success: false, message: 'Please provide ID/email and password.' });
      return;
    }

    const normalized = normalizeLoginIdentifier(rawIdentifier);

    // Look up user by normalized userId or email with password hash included
    const user = await User.findOne({
      $or: [{ userId: normalized }, { email: normalized }],
    }).select('+password');

    if (!user) {
      // Equalize timing with dummy bcrypt compare
      await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
      await logAuditEvent(
        { ip: req.ip, socket: req.socket, get: req.get.bind(req) } as any,
        'LOGIN_FAILED',
        'AUTH',
        normalized,
        { identifier: normalized, reason: 'user_not_found' }
      );
      res.status(401).json({ success: false, message: 'Invalid ID/email or password.' });
      return;
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.max(1, Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000)));
      await logAuditEvent(
        { user, ip: req.ip, socket: req.socket, get: req.get.bind(req) } as any,
        'LOGIN_FAILED',
        'AUTH',
        user._id.toString(),
        { identifier: normalized, reason: 'account_locked', remainingMinutes }
      );
      res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to too many failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
        remainingMinutes,
      });
      return;
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      const maxAttempts = Number(ENV.MAX_LOGIN_ATTEMPTS) || 5;
      const lockoutMinutes = Number(ENV.LOCKOUT_MINUTES) || 15;

      if (user.failedLoginAttempts >= maxAttempts) {
        user.lockUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
        user.failedLoginAttempts = 0;
        await user.save();

        await logAuditEvent(
          { user, ip: req.ip, socket: req.socket, get: req.get.bind(req) } as any,
          'ACCOUNT_LOCKED',
          'AUTH',
          user._id.toString(),
          { identifier: normalized, lockedForMinutes: lockoutMinutes }
        );

        res.status(423).json({
          success: false,
          message: `Account is temporarily locked due to too many failed login attempts. Please try again in ${lockoutMinutes} minute(s).`,
          remainingMinutes: lockoutMinutes,
        });
        return;
      }

      await user.save();
      await logAuditEvent(
        { user, ip: req.ip, socket: req.socket, get: req.get.bind(req) } as any,
        'LOGIN_FAILED',
        'AUTH',
        user._id.toString(),
        { identifier: normalized, failedAttempts: user.failedLoginAttempts }
      );

      res.status(401).json({ success: false, message: 'Invalid ID/email or password.' });
      return;
    }

    // Password is correct. Now check if user is deactivated or removed
    if (!user.isActive || user.removedAt) {
      res.status(403).json({ success: false, message: 'Account disabled, contact your administrator.' });
      return;
    }

    // Reset login failures and update lastLogin
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const familyId = crypto.randomUUID();
    const jti = crypto.randomUUID();
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      jti,
      user: user._id,
      familyId,
      expiresAt: refreshExpiresAt,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    const refreshToken = generateRefreshTokenJwt(jti, user._id.toString(), familyId);
    setRefreshTokenCookie(res, refreshToken);

    let studentProfile = null;
    let mentorProfile = null;
    if (user.role === 'student') {
      studentProfile = await StudentProfile.findOne({ user: user._id }).populate('track batch assignedMentor');
    } else if (user.role === 'mentor') {
      mentorProfile = await MentorProfile.findOne({ user: user._id });
    }

    await logAuditEvent(
      { user, ip: req.ip, socket: req.socket, get: req.get.bind(req) } as any,
      'LOGIN_SUCCESS',
      'AUTH',
      user._id.toString(),
      { identifier: normalized, role: user.role }
    );

    res.status(200).json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isFirstLogin: user.isFirstLogin,
        mustChangePassword: user.mustChangePassword,
        lastLogin: user.lastLogin,
        studentProfile,
        mentorProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!checkOriginAllowed(req)) {
      res.status(403).json({ success: false, message: 'Forbidden origin.' });
      return;
    }

    const rawRefreshToken = req.cookies?.cegs_rt;
    if (!rawRefreshToken) {
      res.status(401).json({ success: false, message: 'Refresh token required.' });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(rawRefreshToken, ENV.JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
        issuer: 'cegs-lms',
        audience: 'cegs-client',
      });
    } catch (err: any) {
      clearRefreshTokenCookie(res);
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
      return;
    }

    const { jti, familyId, sub } = decoded;
    const tokenDoc = await RefreshToken.findOne({ jti });

    if (!tokenDoc) {
      clearRefreshTokenCookie(res);
      res.status(401).json({ success: false, message: 'Refresh session not found.' });
      return;
    }

    // Check if token was already revoked
    if (tokenDoc.revokedAt) {
      const msSinceRevocation = Date.now() - tokenDoc.revokedAt.getTime();
      if (msSinceRevocation < 10000) {
        // 10-second race window for concurrent tabs
        res.status(401).json({
          success: false,
          code: 'REFRESH_RACE',
          message: 'Concurrent refresh in progress, please retry.',
        });
        return;
      }

      // Beyond race window: theft detected! Revoke the whole family
      await RefreshToken.updateMany({ familyId: tokenDoc.familyId }, { revokedAt: new Date() });
      clearRefreshTokenCookie(res);
      res.status(401).json({ success: false, message: 'Invalid session. Token family revoked.' });
      return;
    }

    // Check if user exists and is active
    const user = await User.findById(sub);
    if (!user || !user.isActive || user.removedAt) {
      clearRefreshTokenCookie(res);
      res.status(403).json({ success: false, message: 'Account disabled, contact your administrator.' });
      return;
    }

    // Rotate token
    const newJti = crypto.randomUUID();
    tokenDoc.revokedAt = new Date();
    tokenDoc.replacedBy = newJti;
    await tokenDoc.save();

    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      jti: newJti,
      user: user._id,
      familyId,
      expiresAt: newExpiresAt,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    const newRefreshToken = generateRefreshTokenJwt(newJti, user._id.toString(), familyId);
    setRefreshTokenCookie(res, newRefreshToken);

    const newAccessToken = generateAccessToken(user);

    let studentProfile = null;
    let mentorProfile = null;
    if (user.role === 'student') {
      studentProfile = await StudentProfile.findOne({ user: user._id }).populate('track batch assignedMentor');
    } else if (user.role === 'mentor') {
      mentorProfile = await MentorProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      token: newAccessToken,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isFirstLogin: user.isFirstLogin,
        mustChangePassword: user.mustChangePassword,
        lastLogin: user.lastLogin,
        studentProfile,
        mentorProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Refresh failed.' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current password and new password are required.' });
      return;
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      return;
    }

    const validation = validateNewPassword(newPassword, {
      userId: user.userId,
      email: user.email,
      name: user.name,
      currentPassword,
    });

    if (!validation.valid) {
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    // Set new password (pre-save hook will hash with bcrypt cost 12)
    user.password = newPassword;
    user.mustChangePassword = false;
    user.passwordChangedAt = new Date();
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Revoke all existing refresh sessions
    await RefreshToken.updateMany({ user: user._id }, { revokedAt: new Date() });

    // Issue fresh token pair
    const familyId = crypto.randomUUID();
    const jti = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      jti,
      user: user._id,
      familyId,
      expiresAt,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    const newRefreshToken = generateRefreshTokenJwt(jti, user._id.toString(), familyId);
    setRefreshTokenCookie(res, newRefreshToken);

    const newAccessToken = generateAccessToken(user);

    await logAuditEvent(req, 'PASSWORD_CHANGED', 'AUTH', user._id.toString(), {
      userId: user.userId,
      email: user.email,
    });

    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await StudentProfile.findOne({ user: user._id }).populate('track batch assignedMentor');
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
      token: newAccessToken,
      accessToken: newAccessToken,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isFirstLogin: user.isFirstLogin,
        mustChangePassword: user.mustChangePassword,
        lastLogin: user.lastLogin,
        studentProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Change password failed.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    let studentProfile = null;
    let mentorProfile = null;
    if (req.user.role === 'student') {
      studentProfile = await StudentProfile.findOne({ user: req.user._id }).populate('track batch assignedMentor');
    } else if (req.user.role === 'mentor') {
      mentorProfile = await MentorProfile.findOne({ user: req.user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        isFirstLogin: req.user.isFirstLogin,
        mustChangePassword: req.user.mustChangePassword,
        lastLogin: req.user.lastLogin,
        studentProfile,
        mentorProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!checkOriginAllowed(req)) {
      res.status(403).json({ success: false, message: 'Forbidden origin.' });
      return;
    }

    const rawRefreshToken = req.cookies?.cegs_rt;
    if (rawRefreshToken) {
      try {
        const decoded = jwt.decode(rawRefreshToken) as any;
        if (decoded?.jti) {
          await RefreshToken.findOneAndUpdate({ jti: decoded.jti }, { revokedAt: new Date() });
        }
      } catch (e) {
        // Ignore decode errors on logout
      }
    }

    clearRefreshTokenCookie(res);
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Logout failed.' });
  }
};

export const logoutAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    // Revoke all refresh tokens
    await RefreshToken.updateMany({ user: req.user._id }, { revokedAt: new Date() });

    // Invalidate all access tokens
    req.user.tokenVersion = (req.user.tokenVersion || 0) + 1;
    await req.user.save();

    clearRefreshTokenCookie(res);
    res.status(200).json({ success: true, message: 'Logged out of all sessions successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Logout all failed.' });
  }
};
