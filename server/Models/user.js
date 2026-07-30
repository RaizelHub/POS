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
    pinResetTokenHash: {
      type: String,
      select: false,
    },
    pinResetExpiresAt: {
      type: Date,
      select: false,
    },
    isAdmin: {  // Add this to differentiate admin users
      type: Boolean,
      default: false,  // Default is a regular user
    },
    role: {
      type: String,
      enum: ['owner', 'manager', 'supervisor', 'cashier'],
      default: 'cashier',
      index: true,
    },
    organizationId: {
      type: String,
      default: 'default',
      index: true,
    },
    branchId: {
      type: String,
      default: 'main',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    image: {
      type: String,
      default: '',
    },
    stampdate: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    station: {
      type: String,
      default: 'Unassigned',
    },
  },
  {
    timestamps: true,
  }
);



const UserModel = mongoose.model('User', userSchema);
export default UserModel;
