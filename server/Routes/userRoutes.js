import express from 'express';
import { registerUser, getUsers, getUserById, updateUser, deleteUser, loginUser,verifyEmail,
  getUserTransactions,getLoggedInUser ,updateLoggedInUser,forgotPin, resetPin, getCashierLoginDirectory} from '../Controller/userController.js';
import { completeSale } from '../Controller/saleController.js';
import { requireAuth, requireManager, requireSelfOrManager } from '../Middleware/authorize.js';
  


const router = express.Router();

// Routes for users
router.get('/cashiers/login-directory', getCashierLoginDirectory);
router.post('/register', requireAuth, requireManager, registerUser);
router.get('/users', requireAuth, requireManager, getUsers);
router.get('/users/:id', requireAuth, requireSelfOrManager('id'), getUserById);
router.put('/user/me', requireAuth, updateLoggedInUser);
router.put('/user/:id', requireAuth, requireManager, updateUser);
router.delete('/users/:id', requireAuth, requireManager, deleteUser);
router.get('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/transactions', requireAuth, completeSale);
router.get('/:id/transactions', requireAuth, requireSelfOrManager('id'), getUserTransactions);
router.get('/user/me', requireAuth, getLoggedInUser);
router.post('/forgot-pin', forgotPin);
router.post('/reset-pin/:token', resetPin);



// Login route - ensure user exists, is verified, and PIN matches
// Middleware to verify token

// Protected route to get user profile



export default router;


