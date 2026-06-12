import express from 'express';
import { registerUser, getUsers, getUserById, updateUser, deleteUser, loginUser,verifyEmail,addTransaction,
  getUserTransactions,getLoggedInUser ,updateLoggedInUser,forgotPin, resetPin} from '../Controller/userController.js';
  


const router = express.Router();

// Routes for users
router.post('/register', registerUser);  // Register a new user
router.get('/users', getUsers);  // Get all users
router.get('/users/:id', getUserById);  // Get a user by ID
router.put('/user/me', updateLoggedInUser);
router.put('/user/:id', updateUser);// Update a user by ID
router.delete('/users/:id', deleteUser);  // Delete a user
router.get('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/transactions', addTransaction); // Add a transaction for a user
router.get('/:id/transactions', getUserTransactions);
router.get('/user/me', getLoggedInUser);
router.post('/forgot-pin', forgotPin);
router.post('/reset-pin/:token', resetPin);



// Login route - ensure user exists, is verified, and PIN matches
// Middleware to verify token

// Protected route to get user profile



export default router;


