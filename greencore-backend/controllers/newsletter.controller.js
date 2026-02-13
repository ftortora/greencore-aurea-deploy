import Subscriber from '../models/Subscriber.model.js';
import { sendNewsletterWelcome, sendNewsletterEmail } from '../utils/email.js';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors.js';
import logger from '../utils/logger.js';

// ── SUBSCRIBE ──
export const subscribe = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email) throw new ValidationError('Email obbligatoria.');

    const existing = await Subscriber.findOne({ email: email.toLowerCase() });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictError('Email già iscritta alla newsletter.');
      }
      // Re-activate
      existing.isActive = true;
      existing.name = name || existing.name;
      existing.unsubscribedAt = null;
      existing.subscribedAt = new Date();
      await existing.save();

      sendNewsletterWelcome(existing).catch(() => {});

      return res.json({ success: true, message: 'Iscrizione riattivata!' });
    }

    const subscriber = await Subscriber.create({
      email: email.toLowerCase().trim(),
      name: name?.trim() || '',
    });

    sendNewsletterWelcome(subscriber).catch(() => {});

    logger.info(`Newsletter subscription: ${email}`, { correlationId: req.correlationId });

    res.status(201).json({ success: true, message: 'Iscrizione alla newsletter completata!' });
  } catch (error) {
    next(error);
  }
};

// ── UNSUBSCRIBE (by token) ──
export const unsubscribe = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) throw new ValidationError('Token mancante.');

    const subscriber = await Subscriber.findOne({ unsubscribeToken: token });
    if (!subscriber) throw new NotFoundError('Iscrizione');

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    logger.info(`Newsletter unsubscribe: ${subscriber.email}`);

    res.json({ success: true, message: 'Disiscrizione completata.' });
  } catch (error) {
    next(error);
  }
};

// ── GET ALL SUBSCRIBERS (Admin) ──
export const getSubscribers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    const filter = {};
    if (active !== undefined) filter.isActive = active === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [subscribers, total] = await Promise.all([
      Subscriber.find(filter).sort({ subscribedAt: -1 }).skip(skip).limit(parseInt(limit)),
      Subscriber.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        items: subscribers,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── SEND NEWSLETTER (Admin) ──
export const sendNewsletter = async (req, res, next) => {
  try {
    const { subject, content } = req.body;
    if (!subject || !content) throw new ValidationError('Oggetto e contenuto obbligatori.');

    const subscribers = await Subscriber.find({ isActive: true });

    if (subscribers.length === 0) {
      return res.json({ success: true, message: 'Nessun iscritto attivo.', data: { sent: 0 } });
    }

    let sent = 0;
    let failed = 0;

    // Send emails in batches of 10
    const batchSize = 10;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((sub) => sendNewsletterEmail(sub, subject, content))
      );
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value.success) sent++;
        else failed++;
      });
    }

    logger.info(`Newsletter sent: ${sent} delivered, ${failed} failed`, { correlationId: req.correlationId });

    res.json({
      success: true,
      message: `Newsletter inviata a ${sent} iscritti.`,
      data: { sent, failed, total: subscribers.length },
    });
  } catch (error) {
    next(error);
  }
};

// ── DELETE SUBSCRIBER (Admin) ──
export const deleteSubscriber = async (req, res, next) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) throw new NotFoundError('Iscritto');
    res.json({ success: true, message: 'Iscritto eliminato.' });
  } catch (error) {
    next(error);
  }
};

export default { subscribe, unsubscribe, getSubscribers, sendNewsletter, deleteSubscriber };
