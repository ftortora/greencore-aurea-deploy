import { AuthenticationError, ForbiddenError } from '../utils/errors.js';

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(new AuthenticationError());
  if (!roles.includes(req.user.role)) return next(new ForbiddenError());
  next();
};

export const adminOnly = authorize('admin', 'superadmin');

export default { authorize, adminOnly };
