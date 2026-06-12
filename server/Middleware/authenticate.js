import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header (format: "Bearer <token>")
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    // Replace 'yourSecretKey' with your actual JWT secret key (preferably from an environment variable)
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Add the decoded user info to the request object for access in the next middleware
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();  
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
};

export default authenticateToken;
