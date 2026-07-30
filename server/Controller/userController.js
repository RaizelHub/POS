import UserModel from '../Models/user.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Transaction from '../Models/transaction.js';
import Product from '../Models/product.js';
import Customer from '../Models/customer.js';
import Shift from '../Models/shift.js';
import mongoose from 'mongoose';
import { formatDistanceToNow } from 'date-fns';
import sendStationAssignmentEmail from '../utills/sendStationAssignmentEmail.js';
import crypto from 'crypto';
import { buildOrgBranchFilter } from '../utills/orgBranchFilter.js';





dotenv.config();

const organizationUserScope = (req) => ({
  organizationId: req.auth.organizationId,
  ...(!req.auth.isAdmin && req.auth.role !== 'owner' ? { branchId: req.auth.branchId } : {}),
});

// Token generation utility
const createToken = (id, email, expiresIn = '1d') => {
  const jwtSecretKey = process.env.JWT_SECRET_KEY;
  return jwt.sign({ id, email }, jwtSecretKey, { expiresIn });

};

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Send verification email
export const sendVerificationEmail = (email, verificationToken) => {
  // Use the CLIENT_URL for the frontend page, which will call the API endpoint
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification',
    text: `Please verify your email by clicking: ${verificationUrl}. The link expires in 1 hour.`,
  };
  return transporter.sendMail(mailOptions);
};

// User Registration


export const registerUser = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    pin,
    image,
    role = 'cashier',
    branchId = req.auth?.branchId || 'main',
    station = 'Unassigned',
  } = req.body;

  // Validate required fields
  if (!firstname || !lastname || !email || !pin) {
    // Check which fields are missing
    const missingFields = [];
    if (!firstname) missingFields.push("First Name");
    if (!lastname) missingFields.push("Last Name");
    if (!email) missingFields.push("Email");
    if (!pin) missingFields.push("PIN");


    return res.status(400).json({
      message: `Please fill in all required fields: ${missingFields.join(", ")}.`,
    });
  }

  // Validate PIN (must be 6 digits)
  if (!/^\d{6}$/.test(pin)) {
    return res.status(400).json({
      message: "PIN must be exactly 6 digits.",
    });
  }


  try {
    // Check if the email already exists
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // Create the user object
    const canCreateManager = req.auth?.isAdmin || req.auth?.role === 'owner';
    const allowedRole = role === 'manager' && !canCreateManager
      ? 'cashier'
      : (['manager', 'supervisor', 'cashier'].includes(role) ? role : 'cashier');
    const assignedBranch = canCreateManager && branchId ? branchId : (req.auth?.branchId || 'main');
    const newUser = new UserModel({
      firstname,
      lastname,
      email: normalizedEmail,
      pin: hashedPin,
      isAdmin: false,
      role: allowedRole,
      organizationId: req.auth?.organizationId || 'default',
      branchId: assignedBranch,
      station,
      isVerified: true,
      isActive: true,
      image: image || null,
    });

    await newUser.save();
    res.status(201).json({
      message: 'Cashier account created successfully.',
      user: {
        _id: newUser._id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        role: newUser.role,
        branchId: newUser.branchId,
        station: newUser.station,
      },
    });
  } catch (error) {
    console.error('Error during cashier creation:', error.message);
    res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};


// Email Verification
export const verifyEmail = async (req, res) => {
  const token = req.query.token;

  try {
    if (!token) {
      return res.status(400).send({ message: 'Invalid or missing token.' });
    }

    // Check if the token is expired first
    const decoded = jwt.decode(token);  // Decode without verifying to check expiry time
    if (decoded && decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(400).send({ message: "The verification link has expired. Please request a new one." });
    }

    // Verify the token
    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Decoded Token:", verified);

    // Search for the user with the decoded id and email
    const user = await UserModel.findOne({ _id: verified.id, email: verified.email });
    console.log("Found user:", user ? user.firstname : "User not found");

    if (!user || user.verificationToken !== token) {
      return res.status(404).send({ message: "Invalid or expired verification link." });
    }

    // Set user as verified and clear token
    user.isVerified = true;
    await user.save();

    res.status(200).send({ message: "Email successfully verified. You can now Login...." });
  } catch (error) {
    console.error("Error verifying email:", error);

    // Handle the TokenExpiredError more gracefully
    if (error.name === 'TokenExpiredError') {
      return res.status(400).send({ message: "The verification link has expired. Please request a new one." });
    }

    res.status(500).send({ message: "There was an error verifying the email." });
  }
}



// Login user (validate PIN)
export const loginUser = async (req, res) => {
  const { email, userId, pin } = req.body;

  if ((!email && !userId) || !pin) {
    return res.status(400).json({ message: 'Cashier and PIN are required.' });
  }

  // Validate PIN format (must be 6 digits)
  if (!/^\d{6}$/.test(pin)) {
    return res.status(400).json({ message: 'PIN must be exactly 6 digits.' });
  }

  try {
    const lookup = userId && mongoose.Types.ObjectId.isValid(userId)
      ? { _id: userId }
      : { email: email?.trim().toLowerCase() };
    const user = await UserModel.findOne({ ...lookup, isActive: { $ne: false } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first.' });
    }

    // Trim entered PIN and compare with the stored hashed PIN
    const enteredPin = pin.trim();  // Ensure no spaces are included
    const isMatch = await bcrypt.compare(enteredPin, user.pin);  // Await the result of bcrypt.compare

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid PIN.' });
    }

    // Generate JWT
    user.lastLogin = new Date();
    await user.save();
    const token = jwt.sign({
      id: user._id,
      email: user.email,
      role: user.isAdmin ? 'owner' : user.role,
      organizationId: user.organizationId,
      branchId: user.branchId,
    }, process.env.JWT_SECRET_KEY, { expiresIn: '12h' });

    // Include user details in the response (excluding sensitive fields like `pin`)
    const {
      _id,
      firstname,
      lastname,
      email: userEmail,
      image,
      createdAt,
      lastLogin,
      role,
      organizationId,
      branchId,
      station,
    } = user;

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        _id,
        firstname,
        lastname,
        email: userEmail,
        image,
        createdAt,
        lastLogin,
        role: user.isAdmin ? 'owner' : role,
        organizationId,
        branchId,
        station,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Error logging in.', error: error.message });
  }
};



// Get cashier login directory
export const getCashierLoginDirectory = async (req, res) => {
  try {
    const requestedBranch = req.query.branchId;
    const filter = {
      isAdmin: { $ne: true },
      isVerified: true,
      isActive: { $ne: false },
    };

    if (requestedBranch) {
      filter.branchId = requestedBranch;
    } else {
      filter.$or = [
        { branchId: 'main' },
        { branchId: { $exists: false } },
        { branchId: null },
        { branchId: '' },
      ];
    }

    const users = await UserModel.find(filter)
      .select('_id firstname lastname image station branchId role')
      .sort({ firstname: 1, lastname: 1 })
      .lean();
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching cashier login directory:', error);
    return res.status(500).json({ message: 'Unable to load the cashier directory.' });
  }
};

export const getUsers = async (req, res) => {
  try {
    // Fetch users who are verified and not admins
    const users = await UserModel.find({
      isAdmin: { $ne: true },   // Exclude admins
      isVerified: true,
      ...organizationUserScope(req),
    }).select('-pin -verificationToken');

    res.status(200).json(users); // Send the filtered users in the response
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findOne({
      _id: req.params.id,
      ...organizationUserScope(req),
    }).select('-pin -verificationToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Update user information
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing user ID.' });
    }
    
    const existingUser = await UserModel.findOne({
      _id: id,
      ...organizationUserScope(req),
    });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const allowedFields = ['firstname', 'lastname', 'email', 'pin', 'image', 'role', 'branchId', 'station', 'isActive'];
    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );
    if (!req.auth.isAdmin && req.auth.role !== 'owner') {
      delete updateData.branchId;
      if (updateData.role === 'manager') delete updateData.role;
    }
    if (updateData.pin) {
      const hashedPin = await bcrypt.hash(updateData.pin, 10);
      updateData.pin = hashedPin;
    }

    const stationChanged = updateData.station !== undefined && updateData.station !== existingUser.station;

    const updatedUser = await UserModel.findOneAndUpdate({
      _id: id,
      ...organizationUserScope(req),
    }, updateData, { new: true }).select('-pin -verificationToken');
    
    if (stationChanged) {
      sendStationAssignmentEmail(
        updatedUser.email,
        updatedUser.firstname || 'Cashier',
        updatedUser.lastname || '',
        updatedUser.station
      );
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user.', error: error.message });
  }
};



// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await UserModel.findOneAndUpdate({
      _id: req.params.id,
      ...organizationUserScope(req),
      isAdmin: { $ne: true },
    }, { isActive: false }, { new: true });
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};
import { v4 as uuidv4 } from 'uuid'; // Ensure you have this import for uuid
export const addTransaction = async (req, res) => {
  const {
    userId,
    products,
    paymentMethod,
    paymentStatus,
    transactionDate,
    discountAmount = 0,
    originalAmount = 0,
    promoCode,
    customerId,
    shiftId,
    loyaltyPointsEarned = 0,
    loyaltyPointsRedeemed = 0,
    splitDetails,
  } = req.body;

  console.log('Request Body:', req.body); // Debug log

  // Validate required fields
  if (!userId || !products || !Array.isArray(products) || products.length === 0 || !paymentMethod || !paymentStatus) {
    return res.status(400).json({ message: 'All fields (userId, products, paymentMethod, paymentStatus) are required.' });
  }

  try {
    // Validate transactionDate (optional, default to current date if not provided)
    const actualTransactionDate = transactionDate ? new Date(transactionDate) : new Date();

    // Validate the transaction date format
    if (isNaN(actualTransactionDate)) {
      return res.status(400).json({ message: 'Invalid transaction date format.' });
    }

    // Process the products array and calculate total price for each product
    const processedProducts = products.map(product => ({
      ...product,
      totalPrice: product.price * product.quantity, // Calculate total price
    }));

    // Create a new transaction record
    const transaction = new Transaction({
      userId,
      products: processedProducts,
      paymentMethod,
      paymentStatus,
      transactionId: uuidv4(), // Generate a new transaction ID
      lastUpdated: new Date(),
      transactionDate: actualTransactionDate,
      discountAmount,
      originalAmount,
      promoCode,
      customerId,
      shiftId,
      loyaltyPointsEarned,
      loyaltyPointsRedeemed,
      splitDetails,
    });

    // Save the new transaction
    const savedTransaction = await transaction.save();
    console.log('Transaction saved successfully:', savedTransaction); // Debug log

    // 1. Update active cashier shift if applicable
    if (shiftId) {
      try {
        await Shift.findByIdAndUpdate(shiftId, {
          $inc: { transactionsCount: 1 }
        });
        console.log(`Incremented transactions count for shift ${shiftId}`);
      } catch (shiftError) {
        console.error(`Failed to update shift transactions count:`, shiftError.message);
      }
    }

    // 2. Update customer purchase history and loyalty points if applicable
    if (customerId) {
      try {
        const finalAmount = originalAmount - discountAmount;
        await Customer.findByIdAndUpdate(customerId, {
          $inc: {
            purchaseCount: 1,
            totalSpent: finalAmount > 0 ? finalAmount : 0,
            loyaltyPoints: loyaltyPointsEarned - loyaltyPointsRedeemed
          }
        });
        console.log(`Updated customer loyalty points and spending history for customer ${customerId}`);
      } catch (customerError) {
        console.error(`Failed to update customer purchase history:`, customerError.message);
      }
    }

    // Decrement stock for each product in the transaction
    for (const item of processedProducts) {
      const pId = item.productId || item._id;
      if (pId) {
        try {
          await Product.findByIdAndUpdate(pId, {
            $inc: { quantity: -item.quantity }
          });
          console.log(`Decremented product ${pId} quantity by ${item.quantity}`);
        } catch (stockError) {
          console.error(`Failed to decrement stock for product ${pId}:`, stockError.message);
        }
      }
    }

    // Send the success response
    res.status(201).json({ message: 'Transaction added successfully!', transaction: savedTransaction });
  } catch (error) {
    console.error('Error adding transaction:', error.message); // Debug log
    res.status(500).json({ message: 'Error adding transaction', error: error.message });
  }
};


export const getUserTransactions = async (req, res) => {
  const userId = req.params.id;

  try {
    // Fetch all transactions for the given user
    const transactions = await Transaction.find({
      userId,
      ...buildOrgBranchFilter(req.auth),
      status: { $ne: 'voided' },
    });

    if (!transactions.length) {
      console.log('No transactions found for this user.');
      return res.status(200).json({ paid: [], payLater: [] });
    }

    let paidItems = [];
    let payLaterItems = [];

    // Loop through all transactions and categorize items by paymentStatus
    transactions.forEach((transaction) => {
      // Ensure the products array exists and has items
      if (transaction.products && Array.isArray(transaction.products) && transaction.products.length > 0) {
        // Filter products by paymentStatus and categorize them
        const withTransactionContext = (item) => ({
          ...item.toObject(),
          transactionId: transaction._id,
          receiptNumber: transaction.transactionId,
          balanceDueCents: transaction.balanceDueCents || 0,
          dueDate: transaction.dueDate,
        });
        paidItems = [
          ...paidItems,
          ...transaction.products.filter(item => item.paymentStatus === 'Paid').map(withTransactionContext),
        ];
        payLaterItems = [
          ...payLaterItems,
          ...transaction.products.filter(item => item.paymentStatus === 'Pay Later').map(withTransactionContext),
        ];
      }
    });

    // Send the categorized items back in the response
    res.status(200).json({
      paid: paidItems,
      payLater: payLaterItems,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

export const getLoggedInUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.auth.userId).select('-pin -verificationToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching logged-in user:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Failed to fetch user data.', error: error.message });
  }
};
// Update logged-in user
export const updateLoggedInUser = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const updateData = {};
    if (req.body.firstname?.trim()) updateData.firstname = req.body.firstname;
    if (req.body.lastname?.trim()) updateData.lastname = req.body.lastname;
    if (req.body.image) updateData.image = req.body.image; // Cloudinary URL
    if (req.body.pin?.trim()) {
      const hashedPin = await bcrypt.hash(req.body.pin, 10);
      updateData.pin = hashedPin;
    }
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update.' });
    }
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true })
      .select('-pin -verificationToken');
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Failed to update user.', error: error.message });
  }
};

export const forgotPin = async (req, res) => {
  const normalizedEmail = req.body.email?.trim().toLowerCase();
  const genericMessage = 'If the account exists, a PIN reset link has been sent.';
  if (!normalizedEmail) return res.status(200).json({ message: genericMessage });

  try {
    const user = await UserModel.findOne({
      email: normalizedEmail,
      isActive: { $ne: false },
    }).select('+pinResetTokenHash +pinResetExpiresAt');
    if (!user) return res.status(200).json({ message: genericMessage });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.pinResetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.pinResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Reset your SUELTO PIN',
      text: `Set a new PIN using this one-time link: ${process.env.CLIENT_URL}/reset-pin/${resetToken}`,
    });
    return res.status(200).json({ message: genericMessage });
  } catch (error) {
    console.error('PIN reset email failed:', error.message);
    return res.status(200).json({ message: genericMessage });
  }
};


export const resetPin = async (req, res) => {
  const token = req.params.token || req.body.token;
  const newPin = req.body.newPin;

  if (!token || !/^\d{6}$/.test(newPin || '')) {
    return res.status(400).json({ error: 'A valid reset token and six-digit PIN are required.' });
  }
  if (/^(\d)\1{5}$/.test(newPin) || ['123456', '654321'].includes(newPin)) {
    return res.status(400).json({ error: 'Choose a less predictable PIN.' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await UserModel.findOne({
      pinResetTokenHash: tokenHash,
      pinResetExpiresAt: { $gt: new Date() },
      isActive: { $ne: false },
    }).select('+pinResetTokenHash +pinResetExpiresAt');

    if (!user) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
    }

    user.pin = await bcrypt.hash(newPin, 12);
    user.pinResetTokenHash = undefined;
    user.pinResetExpiresAt = undefined;
    await user.save();

    return res.status(200).json({ message: 'PIN reset successful.' });
  } catch {
    return res.status(500).json({ error: 'Failed to reset PIN.' });
  }
};
