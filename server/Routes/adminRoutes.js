import express from 'express';
import { getAdminProfile, updateAdminProfile, adminLogin } from '../Controller/adminController.js';
import { requireAuth, requireManager } from '../Middleware/authorize.js';

const router = express.Router();

// Admin routes
router.get('/admin/profile', requireAuth, requireManager, getAdminProfile);
router.put('/admin', requireAuth, requireManager, updateAdminProfile);
router.post('/admin/login', adminLogin);
router.get('/admin/token', requireAuth, requireManager, (req, res) => {
  res.status(200).json({ message: 'Welcome, Admin!', user: req.authUser });
});
router.get('/dashboard', requireAuth, requireManager, (req, res) => {
  res.status(200).json({ message: 'Welcome to your admin dashboard', user: req.authUser });
});
export default router;
