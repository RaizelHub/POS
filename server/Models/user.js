import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


// Define schema for User
const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: false, // Optional at registration
    },
    lastname: {
      type: String,
      required: false, // Optional at registration
    },
    email: {
      type: String,
      required: true, // Keep as required
      unique: true,
      match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
    },
    pin: {
      type: String,
      required: true, // Keep as required
      minlength: 6,
      maxlength: 1024,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    isAdmin: {  // Add this to differentiate admin users
      type: Boolean,
      default: false,  // Default is a regular user
    },
    image: {
      type: String,
      default: 'https://path/to/default-image.jpg', // Use default image if no image is provided
    },
    stampdate: {
      type: Date,
      default: Date.now,
    },
    lastLogin: { // Field to track the last login timestamp
      type: Date,
      default: null, // Default is null if the user hasn't logged in yet
    },
  },
  {
    timestamps: true,
  }
);



const UserModel = mongoose.model('User', userSchema);
export default UserModel;
