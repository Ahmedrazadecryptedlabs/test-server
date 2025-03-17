import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.status = err.status || 500;
  err.message = err.message || "error";

  res.status(err.status).json({
    status: err.status,
    message: err.message,
  });
};

export default errorHandler;
