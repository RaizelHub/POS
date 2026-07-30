  import UserModel from '../Models/user.js';
  import bcrypt from 'bcryptjs';
  import jwt from 'jsonwebtoken';

  // Get Admin Profile
  export const getAdminProfile = async (req, res) => {
    try {
      if (!req.authUser) {
        return res.status(400).json({ message: 'Admin data not available' });
      }

      res.status(200).json(req.authUser);
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  // Update Admin Profile
  export const updateAdminProfile = async (req, res) => {
    const { firstname, lastname, email, pin, image } = req.body; // image is now a URL
  
    try {
      // Ensure the authenticated admin's ID is available
    const adminId = req.auth?.userId;
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
    {
      id: adminUser._id,
      isAdmin: adminUser.isAdmin,
      role: 'owner',
      organizationId: adminUser.organizationId || 'default',
      branchId: adminUser.branchId || 'main',
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '12h' }
  );


      // Step 6: Return the token to the frontend
      res.status(200).json({
        token,
        admin: {
          _id: adminUser._id,
          firstname: adminUser.firstname,
          lastname: adminUser.lastname,
          email: adminUser.email,
          image: adminUser.image,
          role: 'owner',
          organizationId: adminUser.organizationId || 'default',
          branchId: adminUser.branchId || 'main',
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  };
  // Authentication is enforced by the shared authorization middleware.
