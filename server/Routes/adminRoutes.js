import express from 'express';
import { getAdminProfile, updateAdminProfile, deleteAdmin ,adminLogin ,verifyAdminToken} from '../Controller/adminController.js';
import authenticateToken from '../Middleware/authenticate.js';

const router = express.Router();

// Admin routes
router.get('/admin/profile', verifyAdminToken, getAdminProfile);
router.put('/admin', verifyAdminToken, updateAdminProfile);
router.delete('/admin', deleteAdmin); // Delete admin account (optional)
router.post('/admin/login', adminLogin);
router.get('/admin/token', authenticateToken, (req, res) => {
  // Check if the user is an admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access forbidden. You are not an admin.' });
  }

  // Proceed with the logic for the protected route
  res.status(200).json({ message: 'Welcome, Admin!', user: req.user });
});
router.get('/dashboard', authenticateToken, (req, res) => {
  // Logic for rendering dashboard
  res.status(200).json({ message: 'Welcome to your admin dashboard', user: req.user });
});
export default router;
