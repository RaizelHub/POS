import express from 'express';
import passport from '../Services/passport.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import authenticateToken from '../Middleware/authenticate.js';

dotenv.config();
const router = express.Router();

// Middleware to verify JWT token
const verifyJWT = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  console.log("Token received:", token);  // Log the token for debugging

  if (!token) {
    return res.status(403).json({ error: true, message: "Not Authorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: true, message: "Not Authorized" });
    }
    req.user = decoded;
    next();
  });
};

// Route for successful login
router.get("/login/success", verifyJWT, (req, res) => {
  console.log("User:", req.user);  // Log the user data
  if (req.user) {
    res.status(200).json({
      error: false,
      message: "Successfully Logged in",
      user: req.user, // Send user data
    });
  } else {
    res.status(403).json({ error: true, message: "Not Authorized" });
  }
});

// Route for failed login
router.get("/login/failed", (req, res) => {
  res.status(401).json({
    error: true,
    message: "Login Failure",
  });
});

// Google login callback route
router.get('/oauth2callback', (req, res, next) => {
  console.log('OAuth callback route hit');
  next();
}, passport.authenticate('google', {
  failureRedirect: `${process.env.CLIENT_URL}/register`, // Redirect on failure
}), async (req, res) => {
  try {
    // Generate a JWT token upon successful login
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },  // payload (user data)
      process.env.JWT_SECRET_KEY,                       // secret key
      { expiresIn: '1h' }                          // expiration time (1 hour in this example)
    );

    // Set the token as a cookie or send it in the response header
    res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 }); // 1 hour cookie
    res.redirect(`${process.env.CLIENT_URL}/login-selection`);
  } catch (error) {
    console.error('Error during token generation:', error);
    res.status(500).json({ error: true, message: 'Internal Server Error' });
  }
});

// Google login route (to initiate OAuth)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: true, message: "Logout Error" });
    }
    res.clearCookie('token');  // Clear the token cookie on logout
    res.redirect(process.env.CLIENT_URL);  // Redirect to client URL
  });
});


router.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Welcome to the protected route', user: req.user });
});


export default router;
