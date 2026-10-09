import dotenv from 'dotenv';
dotenv.config();

const USE_MEMORY_DB = process.env.USE_MEMORY_DB === 'true';

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is missing. Please set it in server/.env.');
}

if (!USE_MEMORY_DB && !process.env.MONGODB_URI) {
  throw new Error('FATAL: MONGODB_URI is required when USE_MEMORY_DB is not true. Please set it in server/.env.');
}

if (!USE_MEMORY_DB && process.env.MONGODB_URI && (process.env.MONGODB_URI.includes('<') || process.env.MONGODB_URI.includes('>'))) {
  throw new Error('FATAL: MONGODB_URI still contains "<" or ">". Please replace <db_password> with your actual MongoDB database password without any brackets in server/.env.');
}

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  USE_MEMORY_DB,
  SEED_ON_START: process.env.SEED_ON_START === 'true',
};
