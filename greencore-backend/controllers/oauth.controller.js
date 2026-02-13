import axios from 'axios';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/config.js';
import User from '../models/User.model.js';
import logger from '../utils/logger.js';

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expire }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpire }
  );
}

function setTokenCookies(res, accessToken, refreshToken) {
  const isProduction = config.env === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

async function findOrCreateOAuthUser({ email, name, username, avatar, provider, providerId }) {
  let user = await User.findOne({
    provider,
    providerId,
  }).select('+refreshTokens');

  if (!user) {
    const existingByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingByEmail) {
      const withTokens = await User.findById(existingByEmail._id).select('+refreshTokens');
      withTokens.provider = provider;
      withTokens.providerId = providerId;
      withTokens.avatar = avatar || withTokens.avatar;
      user = withTokens;
    } else {
      const baseUsername = (username || email.split('@')[0])
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .substring(0, 25);
      let uniqueUsername = baseUsername;
      let counter = 1;
      while (await User.findOne({ username: uniqueUsername.toLowerCase() })) {
        uniqueUsername = `${baseUsername}${counter}`;
        counter++;
      }
      user = await User.create({
        name: name || email.split('@')[0],
        username: uniqueUsername.toLowerCase(),
        email: email.toLowerCase(),
        password: crypto.randomBytes(32).toString('hex'),
        provider,
        providerId,
        avatar: avatar || null,
      });
      user = await User.findById(user._id).select('+refreshTokens');
    }
  }

  return user;
}

export const googleOAuth = async (req, res, next) => {
  try {
    const { code, redirect_uri } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Codice di autorizzazione mancante' });
    }

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      redirect_uri,
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenResponse.data;
    if (!access_token) {
      return res.status(400).json({ success: false, message: 'Token non ricevuto da Google' });
    }

    const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id, email, name, picture } = profileResponse.data;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email non disponibile da Google' });
    }

    const user = await findOrCreateOAuthUser({
      email,
      name,
      username: name || email.split('@')[0],
      avatar: picture,
      provider: 'google',
      providerId: id,
    });

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account disattivato.' });
    }

    user.lastLogin = new Date();
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.addRefreshToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, refreshToken);
    logger.info(`Google OAuth login: ${user.username}`);

    res.json({
      success: true,
      message: 'Login con Google effettuato!',
      data: { user: user.toJSON() },
    });
  } catch (error) {
    if (error.response?.data?.error === 'invalid_grant') {
      return res.status(400).json({
        success: false,
        message: 'Codice scaduto o già utilizzato. Riprova.',
      });
    }
    if (error.response?.data?.error === 'invalid_client') {
      logger.error('Google OAuth: invalid_client — controlla GOOGLE_CLIENT_SECRET nel .env');
      return res.status(500).json({
        success: false,
        message: 'Configurazione Google OAuth non valida.',
      });
    }
    logger.error('Google OAuth Error:', { error: error.response?.data || error.message });
    next(error);
  }
};

export const githubOAuth = async (req, res, next) => {
  try {
    const { code, redirect_uri } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Codice di autorizzazione mancante' });
    }

    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
        redirect_uri,
      },
      { headers: { Accept: 'application/json' } }
    );

    const { access_token, error: tokenError } = tokenResponse.data;
    if (tokenError || !access_token) {
      return res.status(400).json({
        success: false,
        message: tokenError || 'Token non ricevuto da GitHub',
      });
    }

    const [profileResponse, emailsResponse] = await Promise.all([
      axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}` },
      }),
      axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${access_token}` },
      }),
    ]);

    const { id, login: ghUsername, avatar_url, name } = profileResponse.data;
    const primaryEmail = emailsResponse.data.find((e) => e.primary && e.verified);
    const email = primaryEmail?.email || profileResponse.data.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email non disponibile da GitHub. Verifica la tua email su GitHub.',
      });
    }

    const user = await findOrCreateOAuthUser({
      email,
      name: name || ghUsername,
      username: ghUsername || email.split('@')[0],
      avatar: avatar_url,
      provider: 'github',
      providerId: String(id),
    });

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account disattivato.' });
    }

    user.lastLogin = new Date();
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.addRefreshToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, refreshToken);
    logger.info(`GitHub OAuth login: ${user.username}`);

    res.json({
      success: true,
      message: 'Login con GitHub effettuato!',
      data: { user: user.toJSON() },
    });
  } catch (error) {
    logger.error('GitHub OAuth Error:', { error: error.response?.data || error.message });
    next(error);
  }
};
