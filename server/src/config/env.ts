import dotenv from 'dotenv';
dotenv.config();

const USE_MEMORY_DB = process.env.USE_MEMORY_DB === 'true';

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is missing. Please set it in server/.env.');
}
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('FATAL: JWT_SECRET must be at least 32 characters long.');
}

if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error('FATAL: JWT_REFRESH_SECRET environment variable is missing. Please set it in server/.env.');
}
if (process.env.JWT_REFRESH_SECRET.length < 32) {
  throw new Error('FATAL: JWT_REFRESH_SECRET must be at least 32 characters long.');
}
if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
  throw new Error('FATAL: JWT_REFRESH_SECRET must be different from JWT_SECRET.');
}

if (!USE_MEMORY_DB && !process.env.MONGODB_URI) {
  throw new Error('FATAL: MONGODB_URI is required when USE_MEMORY_DB is not true. Please set it in server/.env.');
}

if (!USE_MEMORY_DB && process.env.MONGODB_URI && (process.env.MONGODB_URI.includes('<') || process.env.MONGODB_URI.includes('>'))) {
  throw new Error('FATAL: MONGODB_URI still contains "<" or ">". Please replace <db_password> with your actual MongoDB database password without any brackets in server/.env.');
}

const isProduction = process.env.NODE_ENV === 'production';
const cookieSecure = process.env.COOKIE_SECURE !== undefined ? process.env.COOKIE_SECURE === 'true' : isProduction;
const cookieSameSite = (process.env.COOKIE_SAMESITE as 'lax' | 'strict' | 'none') || 'lax';

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  COOKIE_SECURE: cookieSecure,
  COOKIE_SAMESITE: cookieSameSite,
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
  LOCKOUT_MINUTES: parseInt(process.env.LOCKOUT_MINUTES || '15', 10),
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  USE_MEMORY_DB,
  SEED_ON_START: process.env.SEED_ON_START === 'true',
  SEED_DEMO_DATA: process.env.SEED_DEMO_DATA === 'true',
};

