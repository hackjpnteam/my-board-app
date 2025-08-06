import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/board-app';

if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI environment variable is not set. Using default localhost connection.');
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

interface GlobalWithMongoose {
  mongoose: Cached;
}

const globalWithMongoose = global as unknown as GlobalWithMongoose;

let cached: Cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('MongoDB connection error:', error);
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;