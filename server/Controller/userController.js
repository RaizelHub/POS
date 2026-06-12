import multer from 'multer';
import UserModel from '../Models/user.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import axios from 'axios';
import Transaction from '../Models/transaction.js';
import mongoose from 'mongoose';
import { formatDistanceToNow } from 'date-fns';





dotenv.config();

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage: storage });

// Token generation utility
 const createToken = (id, email, expiresIn = '1d') => {
  const jwtSecretKey = process.env.JWT_SECRET_KEY;
  return jwt.sign({ id, email }, jwtSecretKey,{ expiresIn });

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
  const { firstname, lastname, email, pin,  image } = req.body;

  // Validate required fields
  if (!firstname || !lastname || !email || !pin ) {
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

  // Restrict email to buksu.edu.ph or student.buksu.edu.ph domains only
  const allowedDomains = ["buksu.edu.ph", "student.buksu.edu.ph"];
  const emailParts = email.split("@");

  if (emailParts.length !== 2 || !allowedDomains.includes(emailParts[1])) {
    return res.status(400).json({
      message: "Only emails from buksu.edu.ph or student.buksu.edu.ph are allowed.",
    });
  }

  const session = await UserModel.startSession();
  try {
    session.startTransaction();




    // Check if the email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // Create the user object
    const newUser = new UserModel({
      firstname,
      lastname,
      email,
      pin: hashedPin,
      isAdmin: false,
      isVerified: false,
      image: image || null,
    });

    // Generate and attach a verification token
    const verificationToken = createToken(newUser._id, newUser.email, "1h");
    newUser.verificationToken = verificationToken;

    // Save the user to the database
    await newUser.save({ session });


    // Commit transaction
    await session.commitTransaction();
    console.log("User registered successfully:", newUser.email);

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    res.status(201).json({ message: "User registered successfully! Please verify your email." });
  } catch (error) {
    console.error("Error during registration:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    await session.abortTransaction();
    res.status(500).json({ message: "Internal server error. Please try again later." });
  } finally {
    session.endSession();
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
  const { email, pin } = req.body;

  if (!email || !pin) {
    return res.status(400).json({ message: 'Email and PIN are required.' });
  }

  // Validate PIN format (must be 6 digits)
  if (!/^\d{6}$/.test(pin)) {
    return res.status(400).json({ message: 'PIN must be exactly 6 digits.' });
  }

  try {
    // Find the user by email
    const user = await UserModel.findOne({ email });
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
    const token = createToken(user._id, user.email);

    // Include user details in the response (excluding sensitive fields like `pin`)
    const { _id, firstname, lastname, email: userEmail, image, createdAt ,lastLogin} = user;

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
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Error logging in.', error: error.message });
  }
};



// Get all users
export const getUsers = async (_, res) => {
  try {
    // Fetch users who are verified and not admins
    const users = await UserModel.find({
      isAdmin: { $ne: true },   // Exclude admins
      isVerified: true           // Include only verified users
    });

    res.status(200).json(users); // Send the filtered users in the response
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
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
    const updateData = { ...req.body }; // image is now a URL
    if (updateData.pin) {
      const hashedPin = await bcrypt.hash(updateData.pin, 10);
      updateData.pin = hashedPin;
    }
    const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user.', error: error.message });
  }
};



// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
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
  const { userId, products, paymentMethod, paymentStatus, transactionDate } = req.body;

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
    });

    // Save the new transaction
    const savedTransaction = await transaction.save();
    console.log('Transaction saved successfully:', savedTransaction); // Debug log

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
    const transactions = await Transaction.find({ userId });

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
        paidItems = [
          ...paidItems,
          ...transaction.products.filter(item => item.paymentStatus === 'Paid'),
        ];
        payLaterItems = [
          ...payLaterItems,
          ...transaction.products.filter(item => item.paymentStatus === 'Pay Later'),
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
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('Decoded Token:', decoded);

    const user = await UserModel.findById(decoded.id);
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
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.id;
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
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
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
  const { email } = req.body;

  try {
    console.log('Request received for email:', email);
    const user = await UserModel.findOne({ email });
    if (!user) {
      console.log('No user found with that email');
      return res.status(400).json({ error: 'No user found with that email' });
    }

    console.log('User found:', user.email);

    // Generate a reset token
    const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    console.log('Reset token generated:', resetToken);

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // This allows self-signed certificates
      },
    });


    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your PIN',
      text: `Click on the following link to reset your PIN: ${process.env.CLIENT_URL}/reset-pin/${resetToken}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log('Error sending email:', err);
        return res.status(500).json({ error: 'Error sending email' });
      }
      console.log('Email sent:', info);
      return res.status(200).json({ message: 'Reset link sent to your email' });
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


export const resetPin = async (req, res) => {
  // Get token from either URL parameter or request body
  const token = req.params.token || req.body.token;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    console.log('Attempting to reset PIN with token:', token);

    // Verify the reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await UserModel.findOne({ email: decoded.email });

    if (!user) {
      console.log('No user found for email:', decoded.email);
      return res.status(400).json({ error: 'Invalid token or user not found' });
    }

    console.log('User found:', user.email);

    // Set the PIN to the default value (123456)
    const defaultPin = '123456';
    const hashedPin = await bcrypt.hash(defaultPin, 10);

    // Update the user's PIN
    user.pin = hashedPin;
    await user.save();

    console.log('PIN reset successful for user:', user.email);
    res.status(200).json({ message: 'PIN reset successful' });
  } catch (err) {
    console.error('Error resetting PIN:', err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid token' });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Token has expired' });
    }

    res.status(500).json({ error: 'Server error' });
  }
};
