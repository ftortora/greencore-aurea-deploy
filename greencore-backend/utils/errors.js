export class AppError extends Error {
  constructor(message = 'Errore del server', statusCode = 500, code = 'SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Dati non validi', details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Non autenticato') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class TokenExpiredError extends AppError {
  constructor() {
    super('Token scaduto', 401, 'TOKEN_EXPIRED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Accesso negato') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Risorsa') {
    super(`${resource} non trovato/a`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Risorsa già esistente') {
    super(message, 409, 'CONFLICT');
  }
}

export class AccountLockedError extends AppError {
  constructor(lockUntil) {
    super('Account bloccato per troppi tentativi', 423, 'ACCOUNT_LOCKED');
    this.lockUntil = lockUntil;
  }
}
