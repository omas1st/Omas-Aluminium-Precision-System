import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('⚠️ MONGO_URI is not defined in environment variables. Running in local-only fallback mode.');
    return;
  }

  try {
    if (mongoose.connection.readyState >= 1) {
      isConnected = true;
      return;
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (error) {
    isConnected = false;
    console.error('❌ MongoDB Connection Error:', error);
  }
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
