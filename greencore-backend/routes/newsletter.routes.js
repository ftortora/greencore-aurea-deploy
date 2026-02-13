import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/roles.js';
import { newsletterLimiter } from '../middleware/rateLimiter.js';
import {
  subscribe, unsubscribe, getSubscribers, sendNewsletter, deleteSubscriber,
} from '../controllers/newsletter.controller.js';

const router = Router();

// Public
router.post('/subscribe', newsletterLimiter, subscribe);
router.get('/unsubscribe/:token', unsubscribe);

// Admin only
router.get('/subscribers', authenticate, adminOnly, getSubscribers);
router.post('/send', authenticate, adminOnly, sendNewsletter);
router.delete('/subscribers/:id', authenticate, adminOnly, deleteSubscriber);

export default router;
