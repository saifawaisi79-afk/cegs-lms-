import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { seedDatabase } from './scripts/seed.js';

const app = express();

if (ENV.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow flex in dev for external avatars/embeds
  })
);

app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Request parsing & logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Master API Routes
app.use('/api', routes);

// Centralized error handler
app.use(errorHandler);

// Start Server & Connect Database
export const startServer = async () => {
  try {
    await connectDB();
    if (ENV.SEED_ON_START) {
      await seedDatabase();
    }

    const server = app.listen(ENV.PORT, () => {
      console.log(`
==============================================================
🚀 CAREER EXPERT GLOBAL SOLUTIONS - LMS BACKEND RUNNING
==============================================================
📡 Server Port: ${ENV.PORT}
🌐 API Endpoint: http://localhost:${ENV.PORT}/api
📋 Health Check: http://localhost:${ENV.PORT}/api/health
🎓 Program: 6-Month Freshers Growth Training Program
==============================================================
      `);
    });

    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    return server;
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

if (process.env.USE_MEMORY_DB !== 'true') {
  startServer();
}

export default app;
