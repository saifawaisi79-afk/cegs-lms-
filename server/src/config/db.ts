import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ENV } from './env.js';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  mongoose.connection.on('connected', () => console.log('🟢 MongoDB connection established.'));
  mongoose.connection.on('error', (err) => console.error('🔴 MongoDB connection error:', err.message));
  mongoose.connection.on('disconnected', () => console.log('🟡 MongoDB disconnected.'));

  try {
    if (ENV.USE_MEMORY_DB) {
      console.log('⚡ Initializing Embedded MongoDB (MongoMemoryServer) for zero-setup execution...');
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`✅ Embedded MongoDB connected successfully at ${uri}`);
      return;
    }

    console.log('Connecting to external MongoDB...');
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ Connected to MongoDB successfully. Host: ${mongoose.connection.host}, Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(`❌ Failed to connect to external MongoDB.
Likely causes:
  - Wrong password ("bad auth")
  - Your IP is not allowed in Atlas Network Access
  - Network/DNS blocking the mongodb+srv lookup
Error details:`, (error as Error).message);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

process.on('SIGINT', async () => {
  await disconnectDB();
  console.log('MongoDB connection closed due to app termination (SIGINT).');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  console.log('MongoDB connection closed due to app termination (SIGTERM).');
  process.exit(0);
});
