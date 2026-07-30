import jwt from 'jsonwebtoken';
import UserModel from '../Models/user.js';

const extractBearerToken = (req) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) return null;
  return authorization.slice(7).trim();
};

export const requireAuth = async (req, res, next) => {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Authentication is required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.id || decoded.userId;
    const user = userId
      ? await UserModel.findById(userId).select('-pin -verificationToken')
      : null;

    if (!user || user.isActive === false) {
      return res.status(401).json({ message: 'Your account is unavailable.' });
    }

    req.auth = {
      userId: user._id.toString(),
      organizationId: user.organizationId || 'default',
      branchId: user.branchId || 'main',
      role: user.isAdmin ? 'owner' : (user.role || 'cashier'),
      isAdmin: Boolean(user.isAdmin),
    };
    req.authUser = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};

export const requireRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.auth) {
    return res.status(500).json({ message: 'Authorization middleware is misconfigured.' });
  }

  if (req.auth.isAdmin || allowedRoles.includes(req.auth.role)) {
    return next();
  }

  return res.status(403).json({ message: 'You do not have permission to perform this action.' });
};

export const requireManager = requireRoles('owner', 'manager');
export const requireSupervisor = requireRoles('owner', 'manager', 'supervisor');

export const requireSelfOrManager = (paramName = 'id') => (req, res, next) => {
  if (
    req.auth?.isAdmin ||
    ['owner', 'manager'].includes(req.auth?.role) ||
    req.auth?.userId === req.params[paramName]
  ) {
    return next();
  }

  return res.status(403).json({ message: 'You can only access your own records.' });
};
