import connectDB from '../db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the server's .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Log the MongoDB URI (without showing the full connection string for security)
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in the environment variables');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    const conn = await connectDB();
    console.log('Connection successful!');
    console.log('Database name:', conn.connection.name);
    process.exit(0);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

testConnection();
