import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  authLimiter,
  passwordResetLimiter,
} from "../middleware/rateLimiter.js";

import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  googleAuth,
  githubAuth,
  forgotPassword,
  resetPassword,
  recoverUsername,
} from "../controllers/auth.controller.js";

const router = Router();

// Public auth routes
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refreshToken);

router.post("/google", googleAuth);
router.post("/github", githubAuth);

// Password recovery
router.post("/forgot-password", passwordResetLimiter, forgotPassword);


router.post("/reset-password", passwordResetLimiter, resetPassword);
router.post("/reset-password/:token", passwordResetLimiter, resetPassword);

router.post("/recover-username", passwordResetLimiter, recoverUsername);

// Protected routes
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

export default router;
