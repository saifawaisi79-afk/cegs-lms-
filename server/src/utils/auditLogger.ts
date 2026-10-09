import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest } from '../middleware/auth.js';

export const logAuditEvent = async (
  req: AuthRequest,
  action: string,
  module: string,
  recordId: string = '',
  metadata: Record<string, any> = {}
): Promise<void> => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.get('user-agent') || '';

    await AuditLog.create({
      user: req.user?._id,
      userName: req.user?.name || 'System / Anonymous',
      userRole: req.user?.role || 'anonymous',
      action,
      module,
      recordId,
      ipAddress,
      userAgent,
      metadata,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
