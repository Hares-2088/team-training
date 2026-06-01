import mongoose, { type Mongoose } from 'mongoose';

import '@/models/User';
import '@/models/Team';
import '@/models/WorkoutPlan';
import '@/models/Training';
import '@/models/WorkoutLog';
import '@/models/TrainingGenerationRequest';
import '@/models/UserProgressImage';

type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/team-training';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const cached: MongooseCache = globalThis.mongoose ?? { conn: null, promise: null };
globalThis.mongoose = cached;

export async function connectDB(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

declare global {
  var mongoose: MongooseCache | undefined;
}
