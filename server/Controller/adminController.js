  import express from 'express'
  import UserModel from '../Models/user.js';
  import bcrypt from 'bcryptjs';
  import jwt from 'jsonwebtoken';

  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
  // Get Admin Profile
  export const getAdminProfile = async (req, res) => {
    try {
      if (!req.admin) {
        return res.status(400).json({ message: 'Admin data not available' });
      }
  
      const admin = req.admin;
      console.log('Admin profile data:', admin); // Log admin data to check
  
      res.status(200).json(admin);
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  
  export const verifyAdminToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received Token:', token);  // Log the received token
  
    if (!token) {
      return res.status(401).json({ message: 'Token required for authentication' });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET_KEY);
      console.log('Decoded Token:', decoded);  // Log the decoded token to see what it contains
  
      const admin = await UserModel.findById(decoded.userId);
      console.log('Admin from decoded token:', admin);  // Log the fetched admin
  
      if (!admin) {
        return res.status(401).json({ message: 'Admin not found' });
      }
  
      if (!admin.isAdmin) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
  
      req.admin = admin;  // Attach the admin to the request
      console.log('Admin data attached to request:', req.admin);  // Log the attached admin
  
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
  
  

  // Update Admin Profile
  export const updateAdminProfile = async (req, res) => {
    const { firstname, lastname, email, pin, image } = req.body; // image is now a URL
  
    try {
      // Ensure the authenticated admin's ID is available
      const adminId = req.admin?.id; // Requires middleware to set req.admin
      if (!adminId) {
        return res.status(401).json({ message: 'Unauthorized: Admin ID not found' });
      }
  
      // Find the admin using the authenticated admin's ID
      const admin = await UserModel.findById(adminId);
      if (!admin || !admin.isAdmin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      // Update fields
      if (firstname) admin.firstname = firstname;
      if (lastname) admin.lastname = lastname;
      if (email) admin.email = email;
      if (image) admin.image = image; // Save Cloudinary URL
  
      if (pin) {
        // Validate the pin (e.g., minimum length)
        if (pin.length < 6) {
          return res.status(400).json({ message: 'Pin must be at least 6 characters' });
        }
  
        // Hash the pin before saving it
        const hashedPin = await bcrypt.hash(pin, 10);
        admin.pin = hashedPin;
      }
  
      // Save the updated admin profile
      await admin.save();
  
      res.status(200).json({ message: 'Admin profile updated successfully', admin });
    } catch (error) {
      console.error('Error updating admin profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

  // Delete Admin Account (Optional)
  export const deleteAdmin = async (req, res) => {
    try {
      // Prevent deleting the last admin
      const adminsCount = await UserModel.countDocuments({ isAdmin: true });
      if (adminsCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin' });
      }
  
      const admin = await UserModel.findOneAndDelete({ isAdmin: true });
  
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
      console.error('Error deleting admin:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  export const adminLogin = async (req, res) => {
    const { email, pin } = req.body;

    // Step 1: Validate the input (email and PIN)
    if (!email || !pin) {
      return res.status(400).json({ message: 'Email and PIN are required.' });
    }

    try {
      // Step 2: Find the user who is an admin (check isAdmin flag)
      const adminUser = await UserModel.findOne({ email });

      // Step 3: If the user is not an admin, return Unauthorized response
      if (!adminUser || !adminUser.isAdmin) { 
        console.error(`Unauthorized login attempt for email: ${email}`);
        return res.status(401).json({ message: 'Unauthorized access. Admin privileges required.' });
      }

      // Step 4: Compare the provided PIN with the stored (hashed) PIN
      const isPinValid = await bcrypt.compare(pin, adminUser.pin);
      if (!isPinValid) {
        console.error(`Invalid PIN for email: ${email}`);
        return res.status(401).json({ message: 'Incorrect PIN.' }); // Updated error message
      }

      // Step 5: Generate JWT token for the admin user
      // Step 5: Generate JWT token for the admin user
  const token = jwt.sign(
    { userId: adminUser._id, isAdmin: adminUser.isAdmin },
    JWT_SECRET_KEY,
    { expiresIn: '1h' } // Make sure the token expires after some time to manage session validity
  );


      // Step 6: Return the token to the frontend
      res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  };
  // Middleware to verify token
  