import jwt from "jsonwebtoken";
import config from "../config/config.js";
import User from "../models/User.model.js";
import {
  AuthenticationError,
  TokenExpiredError,
  ForbiddenError,
} from "../utils/errors.js";

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1) Bearer header (support)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) token = authHeader.split(" ")[1];

    // 2) Cookie httpOnly (primary in your app)
    if (!token) {
      token =
        req.cookies?.accessToken ||
        req.cookies?.token ||
        req.cookies?.jwt ||
        null;
    }

    if (!token) throw new AuthenticationError("Token non fornito.");

    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await User.findById(decoded.id).select(
      "-password -refreshTokens"
    );
    if (!user) throw new AuthenticationError("Utente non trovato.");
    if (!user.isActive) throw new ForbiddenError("Account disattivato.");

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError")
      return next(new TokenExpiredError());
    if (error.name === "JsonWebTokenError")
      return next(new AuthenticationError("Token non valido."));
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) token = authHeader.split(" ")[1];

    if (!token) {
      token =
        req.cookies?.accessToken ||
        req.cookies?.token ||
        req.cookies?.jwt ||
        null;
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id).select(
        "-password -refreshTokens"
      );
      if (user?.isActive) req.user = user;
    }
  } catch {
    /* silent */
  }
  next();
};
