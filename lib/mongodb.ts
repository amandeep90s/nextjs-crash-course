import mongoose from 'mongoose';

// Define a type for caching the Mongoose connection
type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Extend the global object to include the mongoose cache
declare global {
  var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

// Initialize the cache on the global object to persist across hot reloads in development
const cached: MongooseCache = global.mongooseCache || {
  connection: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Caches the connection to prevent multiple connections during development hot reloads.
 * @returns Promise resolving to the Mongoose instance
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return the existing connection if already established
  if (cached.connection) {
    return cached.connection;
  }

  // Return the existing promise if a connection is in progress
  if (!cached.promise) {
    // Validate the MongoDB URI exists
    if (!MONGODB_URI) {
      throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    }

    const options = {
      bufferCommands: false, // Disable mongoose buffering
    };

    // Create a new connection promise
    cached.promise = mongoose.connect(MONGODB_URI, options).then(mongoose => {
      return mongoose;
    });
  }

  try {
    // Wait for the connection to establish
    cached.connection = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset the promise on failure
    throw error;
  }

  return cached.connection;
}

export default connectDB;
