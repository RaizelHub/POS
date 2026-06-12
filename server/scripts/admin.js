import connectDB from '../db.js'; // Import DB connection
import UserModel from '../Models/user.js'; // Import the User model
import bcrypt from 'bcryptjs'; // Import bcrypt
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

// Connect to DB before running the script
async function run() {
  try {
    await connectDB();

    const newAdmin = new UserModel({
      firstname: 'Mark',
      lastname: 'lead',
      email: 'test@gmail.com',
      isVerified: true,
      pin: '098765',  // Plain text pin that will be hashed
      isAdmin: true,
      image: "", // Mark this user as an admin
    });

    // Use async/await with bcrypt for better error handling
    try {
      // Hash the pin
      const hashedPin = await bcrypt.hash(newAdmin.pin, 10);

      // Set the hashed pin to the user document
      newAdmin.pin = hashedPin;

      // Save the new admin user with the hashed pin
      await newAdmin.save();
      console.log('Admin user created successfully');

      // Exit the process after successful creation
      process.exit(0);
    } catch (error) {
      console.error('Error creating admin user:', error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

// Run the script
run();
