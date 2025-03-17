class AppError extends Error {
  public status: number;
  public message: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.status = statusCode;
    this.message = message;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

class BadGateWayError extends AppError {
  constructor(message: string) {
    super(message, 502);
  }
}

class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}

export {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  BadGateWayError,
};
