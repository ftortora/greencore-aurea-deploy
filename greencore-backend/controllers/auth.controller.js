import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import config from "../config/config.js";
import User from "../models/User.model.js";
import logger from "../utils/logger.js";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendUsernameRecoveryEmail,
  sendAccountLockedEmail,
} from "../utils/email.js";
import {
  AuthenticationError,
  ValidationError,
  ConflictError,
  AccountLockedError,
} from "../utils/errors.js";

const googleClient = new OAuth2Client(config.google.clientId);

function generateAccessToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user._id, type: "refresh" }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpire,
  });
}

function setTokenCookies(res, accessToken, refreshToken) {
  const isProduction = config.env === "production";
  
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: isProduction ? 'none' : 'lax',
    path: "/",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearTokenCookies(res) {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
}

function sanitize(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}

export const register = async (req, res, next) => {
  try {
    let { name, username, email, password } = req.body;

    if (!name) name = username;

    if (!name || !username || !email || !password) {
      throw new ValidationError("Tutti i campi sono obbligatori.");
    }
    if (password.length < 8) {
      throw new ValidationError("La password deve avere almeno 8 caratteri.");
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });
    if (existingUser) {
      throw new ConflictError(
        existingUser.email === email.toLowerCase()
          ? "Email già registrata."
          : "Username già in uso."
      );
    }

    const user = await User.create({
      name: sanitize(name),
      username: sanitize(username).toLowerCase(),
      email: email.toLowerCase().trim(),
      password,
      provider: "local",
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const userWithTokens = await User.findById(user._id).select(
      "+refreshTokens"
    );
    userWithTokens.addRefreshToken(refreshToken);
    userWithTokens.lastLogin = new Date();
    await userWithTokens.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, refreshToken);

    sendWelcomeEmail(user).catch((err) =>
      logger.error("Welcome email failed", { error: err.message })
    );

    logger.info(`User registered: ${user.username}`, {
      correlationId: req.correlationId,
    });

    res.status(201).json({
      success: true,
      message: "Registrazione completata!",
      data: {
        user: user.toJSON(),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { login: loginField, password } = req.body;

    if (!loginField || !password) {
      throw new ValidationError("Email/username e password sono obbligatori.");
    }

    const isEmail = loginField.includes("@");
    const query = isEmail
      ? { email: loginField.toLowerCase() }
      : { username: loginField.toLowerCase() };

    const user = await User.findOne(query).select(
      "+password +loginAttempts +lockUntil +refreshTokens"
    );

    if (!user) {
      throw new AuthenticationError("Credenziali non valide.");
    }

    if (user.isLocked) {
      throw new AccountLockedError(user.lockUntil);
    }

    if (!user.isActive) {
      throw new AuthenticationError(
        "Account disattivato. Contatta il supporto."
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      if (user.loginAttempts + 1 >= config.accountLockout.maxAttempts) {
        sendAccountLockedEmail(user).catch(() => {});
      }
      throw new AuthenticationError("Credenziali non valide.");
    }

    user.resetLoginAttempts();
    user.lastLogin = new Date();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.addRefreshToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, refreshToken);

    logger.info(`User login: ${user.username}`, {
      correlationId: req.correlationId,
    });

    res.json({
      success: true,
      message: "Login effettuato!",
      data: {
        user: user.toJSON(),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken && req.user) {
      const user = await User.findById(req.user._id).select("+refreshTokens");
      if (user) {
        user.removeRefreshToken(refreshToken);
        await user.save({ validateBeforeSave: false });
      }
    }
    clearTokenCookies(res);
    res.json({ success: true, message: "Logout effettuato." });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AuthenticationError("Refresh token non presente.");

    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    const user = await User.findById(decoded.id).select("+refreshTokens");

    if (!user || !user.isActive) {
      throw new AuthenticationError("Sessione non valida.");
    }

    if (!user.refreshTokens.includes(token)) {
      user.clearAllSessions();
      await user.save({ validateBeforeSave: false });
      clearTokenCookies(res);
      throw new AuthenticationError(
        "Sessione compromessa. Effettua nuovamente il login."
      );
    }

    user.removeRefreshToken(token);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.addRefreshToken(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, newAccessToken, newRefreshToken);

    res.json({
      success: true,
      message: "Token aggiornato.",
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      clearTokenCookies(res);
      return next(
        new AuthenticationError(
          "Sessione scaduta. Effettua nuovamente il login."
        )
      );
    }
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
};

export const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) throw new ValidationError("Google ID Token mancante.");

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });

    const { sub: googleId, email, name, picture } = ticket.getPayload();
    if (!email) throw new ValidationError("Email non disponibile da Google.");

    let user = await User.findOne({
      provider: "google",
      providerId: googleId,
    }).select("+refreshTokens");

    if (!user) {
      const existingByEmail = await User.findOne({
        email: email.toLowerCase(),
      });
      if (existingByEmail) {
        const withTokens = await User.findById(existingByEmail._id).select(
          "+refreshTokens"
        );
        withTokens.provider = "google";
        withTokens.providerId = googleId;
        withTokens.avatar = picture || withTokens.avatar;
        user = withTokens;
      } else {
        const baseUsername = (name || email.split("@")[0])
          .replace(/[^a-zA-Z0-9_]/g, "_")
          .substring(0, 25);

        let uniqueUsername = baseUsername;
        let counter = 1;
        while (await User.findOne({ username: uniqueUsername.toLowerCase() })) {
          uniqueUsername = `${baseUsername}${counter}`;
          counter++;
        }

        user = await User.create({
          name: name || email.split("@")[0],
          username: uniqueUsername.toLowerCase(),
          email: email.toLowerCase(),
          password: crypto.randomBytes(32).toString("hex"),
          provider: "google",
          providerId: googleId,
          avatar: picture || null,
        });
        user = await User.findById(user._id).select("+refreshTokens");

        sendWelcomeEmail(user).catch(() => {});
      }
    }

    if (!user.isActive) throw new AuthenticationError("Account disattivato.");

    user.lastLogin = new Date();
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.addRefreshToken(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, newRefreshToken);

    logger.info(`Google OAuth login: ${user.username}`, {
      correlationId: req.correlationId,
    });

    res.json({
      success: true,
      message: "Login con Google effettuato!",
      data: {
        user: user.toJSON(),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const githubAuth = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) throw new ValidationError("Codice GitHub mancante.");

    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: config.github.clientId,
          client_secret: config.github.clientSecret,
          code,
        }),
      }
    );

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      throw new AuthenticationError(
        `GitHub OAuth failed: ${
          tokenData.error_description || tokenData.error || "Unknown error"
        }`
      );
    }

    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const githubUser = await userRes.json();

    let email = githubUser.email;
    if (!email) {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const emails = await emailsRes.json();
      const primaryEmail = emails.find((e) => e.primary && e.verified);
      email = primaryEmail?.email || emails[0]?.email;
    }

    if (!email) {
      throw new ValidationError(
        "Email non disponibile dal profilo GitHub. Assicurati che la tua email sia pubblica o verificata."
      );
    }

    const githubId = String(githubUser.id);

    let user = await User.findOne({
      provider: "github",
      providerId: githubId,
    }).select("+refreshTokens");

    if (!user) {
      const existingByEmail = await User.findOne({
        email: email.toLowerCase(),
      });
      if (existingByEmail) {
        const withTokens = await User.findById(existingByEmail._id).select(
          "+refreshTokens"
        );
        withTokens.provider = "github";
        withTokens.providerId = githubId;
        withTokens.avatar = githubUser.avatar_url || withTokens.avatar;
        user = withTokens;
      } else {
        const baseUsername = (githubUser.login || email.split("@")[0])
          .replace(/[^a-zA-Z0-9_]/g, "_")
          .substring(0, 25);

        let uniqueUsername = baseUsername;
        let counter = 1;
        while (await User.findOne({ username: uniqueUsername.toLowerCase() })) {
          uniqueUsername = `${baseUsername}${counter}`;
          counter++;
        }

        user = await User.create({
          name: githubUser.name || githubUser.login || email.split("@")[0],
          username: uniqueUsername.toLowerCase(),
          email: email.toLowerCase(),
          password: crypto.randomBytes(32).toString("hex"),
          provider: "github",
          providerId: githubId,
          avatar: githubUser.avatar_url || null,
        });
        user = await User.findById(user._id).select("+refreshTokens");

        sendWelcomeEmail(user).catch(() => {});
      }
    }

    if (!user.isActive) throw new AuthenticationError("Account disattivato.");

    user.lastLogin = new Date();
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.addRefreshToken(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, newRefreshToken);

    logger.info(`GitHub OAuth login: ${user.username}`, {
      correlationId: req.correlationId,
    });

    res.json({
      success: true,
      message: "Login con GitHub effettuato!",
      data: {
        user: user.toJSON(),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new ValidationError("Email obbligatoria.");

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+resetPasswordToken +resetPasswordExpires"
    );

    if (!user) {
      return res.json({
        success: true,
        message:
          "Se l'email è registrata, riceverai le istruzioni per il reset.",
      });
    }

    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user, resetToken);

    logger.info(`Password reset requested: ${user.email}`, {
      correlationId: req.correlationId,
    });

    res.json({
      success: true,
      message: "Se l'email è registrata, riceverai le istruzioni per il reset.",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      throw new ValidationError("Token e nuova password obbligatori.");
    }
    if (password.length < 8) {
      throw new ValidationError("La password deve avere almeno 8 caratteri.");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires +refreshTokens");

    if (!user) {
      throw new AuthenticationError("Token non valido o scaduto.");
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.clearAllSessions();
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    logger.info(`Password reset completed: ${user.email}`, {
      correlationId: req.correlationId,
    });

    res.json({
      success: true,
      message:
        "Password reimpostata con successo. Puoi ora effettuare il login.",
    });
  } catch (error) {
    next(error);
  }
};

export const recoverUsername = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new ValidationError("Email obbligatoria.");

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      await sendUsernameRecoveryEmail(user);
    }

    res.json({
      success: true,
      message: "Se l'email è registrata, riceverai il tuo username.",
    });
  } catch (error) {
    next(error);
  }
};

export default {
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
};
