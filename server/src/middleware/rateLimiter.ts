import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    return req.ip + '_' + (req.body.email || '');
  },
  message: {
    success: false,
    message: 'Too many failed requests, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
