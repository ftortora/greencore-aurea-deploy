import logger from '../utils/logger.js';

const errorHandler = (err, req, res, _next) => {
  const correlationId = req.correlationId;

  // Operational errors (our custom errors)
  if (err.isOperational) {
    logger.warn(err.message, { code: err.code, statusCode: err.statusCode, correlationId });
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      ...(err.details && { details: err.details }),
      ...(err.lockUntil && { lockUntil: err.lockUntil }),
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false, code: 'VALIDATION_ERROR', message: messages.join('. '), details: messages,
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false, code: 'CONFLICT', message: `${field} già esistente.`,
    });
  }

  // Mongoose CastError
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false, code: 'INVALID_ID', message: 'ID non valido.',
    });
  }

  // Unhandled
  logger.error('Unhandled error', { error: err.message, stack: err.stack, correlationId });
  res.status(500).json({
    success: false, code: 'SERVER_ERROR', message: 'Errore interno del server.',
  });
};

export default errorHandler;
