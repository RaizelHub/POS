import mongoose from "mongoose";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name when using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = async () => {
  try {
    // Use environment variable for MongoDB URI
    const MONGODB_URI = process.env.MONGODB_URI;

    // Check if MONGODB_URI is defined
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Only exit the process if not being imported as a module
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error; // Re-throw the error for handling by the caller
  }
};

export default connectDB;