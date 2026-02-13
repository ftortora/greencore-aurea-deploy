import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/roles.js';
import {
  getSystemStats, getUsers, updateUserRole, toggleUserActive, deleteUser,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/stats', getSystemStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/toggle-active', toggleUserActive);
router.delete('/users/:id', deleteUser);

export default router;
