import rateLimit from 'express-rate-limit';

export function normalizeLoginIdentifier(identifier?: string): string {
  if (!identifier || typeof identifier !== 'string') return '';
  const trimmed = identifier.trim();
  if (/^(MNTR|STD|ADM)\d+$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return trimmed.toLowerCase();
}

export const loginFailedAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const id = normalizeLoginIdentifier(req.body.identifier || req.body.email);
    return `${req.ip}_${id}`;
  },
  message: {
    success: false,
    message: 'Too many failed login attempts for this account. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const ipFailedAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.ip || 'unknown-ip',
  message: {
    success: false,
    message: 'Too many failed login attempts from this IP address. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
