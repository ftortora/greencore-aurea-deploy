import User from '../models/User.model.js';
import EnergyData from '../models/EnergyData.model.js';
import Subscriber from '../models/Subscriber.model.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';
import logger from '../utils/logger.js';

// ── SYSTEM STATS ──
export const getSystemStats = async (req, res, next) => {
  try {
    const [
      totalUsers, activeUsers, totalEnergy, totalSubscribers, activeSubscribers,
      recentUsers, roleBreakdown,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      EnergyData.countDocuments(),
      Subscriber.countDocuments(),
      Subscriber.countDocuments({ isActive: true }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers },
        energy: { totalEntries: totalEnergy },
        newsletter: { total: totalSubscribers, active: activeSubscribers },
        recentUsers,
        roleBreakdown: Object.fromEntries(roleBreakdown.map((r) => [r._id, r.count])),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET ALL USERS ──
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, active } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (active !== undefined) filter.isActive = active === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        items: users,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE USER ROLE ──
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['user', 'editor', 'admin', 'superadmin'];
    if (!role || !validRoles.includes(role)) {
      throw new ValidationError(`Ruolo non valido. Ruoli ammessi: ${validRoles.join(', ')}`);
    }

    // Only superadmin can set superadmin
    if (role === 'superadmin' && req.user.role !== 'superadmin') {
      throw new ForbiddenError('Solo un superadmin può assegnare il ruolo superadmin.');
    }

    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError('Utente');

    // Cannot change own role
    if (user._id.toString() === req.user._id.toString()) {
      throw new ForbiddenError('Non puoi modificare il tuo stesso ruolo.');
    }

    user.role = role;
    await user.save({ validateBeforeSave: false });

    logger.info(`Role updated: ${user.username} → ${role}`, { correlationId: req.correlationId });

    res.json({ success: true, data: user, message: `Ruolo aggiornato a ${role}.` });
  } catch (error) {
    next(error);
  }
};

// ── TOGGLE USER ACTIVE ──
export const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError('Utente');

    if (user._id.toString() === req.user._id.toString()) {
      throw new ForbiddenError('Non puoi disattivare il tuo account.');
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    logger.info(`User ${user.isActive ? 'activated' : 'deactivated'}: ${user.username}`);

    res.json({
      success: true,
      data: user,
      message: `Utente ${user.isActive ? 'attivato' : 'disattivato'}.`,
    });
  } catch (error) {
    next(error);
  }
};

// ── DELETE USER ──
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError('Utente');

    if (user._id.toString() === req.user._id.toString()) {
      throw new ForbiddenError('Non puoi eliminare il tuo account da qui.');
    }

    await EnergyData.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);

    logger.info(`User deleted: ${user.username}`, { correlationId: req.correlationId });

    res.json({ success: true, message: 'Utente e dati eliminati.' });
  } catch (error) {
    next(error);
  }
};

export default { getSystemStats, getUsers, updateUserRole, toggleUserActive, deleteUser };
