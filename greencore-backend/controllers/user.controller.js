import User from '../models/User.model.js';
import EnergyData from '../models/EnergyData.model.js';
import { ValidationError, AuthenticationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

// ── GET PROFILE ──
export const getProfile = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

// ── UPDATE PROFILE ──
export const updateProfile = async (req, res, next) => {
  try {
    const { name, username, email } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (username && username !== user.username) {
      const exists = await User.findOne({ username: username.toLowerCase(), _id: { $ne: user._id } });
      if (exists) throw new ValidationError('Username già in uso.');
      user.username = username.toLowerCase().trim();
    }
    if (email && email !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (exists) throw new ValidationError('Email già registrata.');
      user.email = email.toLowerCase().trim();
    }

    await user.save();
    logger.info(`Profile updated: ${user.username}`);
    res.json({ success: true, data: { user }, message: 'Profilo aggiornato!' });
  } catch (error) {
    next(error);
  }
};

// ── CHANGE PASSWORD ──
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ValidationError('Password attuale e nuova password obbligatorie.');
    }
    if (newPassword.length < 8) {
      throw new ValidationError('La nuova password deve avere almeno 8 caratteri.');
    }

    const user = await User.findById(req.user._id).select('+password +refreshTokens');

    if (user.provider !== 'local') {
      throw new ValidationError('Il cambio password non è disponibile per account OAuth.');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AuthenticationError('Password attuale non corretta.');
    }

    user.password = newPassword;
    user.clearAllSessions();
    await user.save();

    logger.info(`Password changed: ${user.username}`);
    res.json({ success: true, message: 'Password cambiata con successo. Effettua nuovamente il login.' });
  } catch (error) {
    next(error);
  }
};

// ── DELETE ACCOUNT ──
export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (user.provider === 'local') {
      if (!password) throw new ValidationError('Password obbligatoria per eliminare l\'account.');
      const isMatch = await user.comparePassword(password);
      if (!isMatch) throw new AuthenticationError('Password non corretta.');
    }

    await EnergyData.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);

    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    logger.info(`Account deleted: ${user.username}`);
    res.json({ success: true, message: 'Account eliminato con successo.' });
  } catch (error) {
    next(error);
  }
};

export default { getProfile, updateProfile, changePassword, deleteAccount };
