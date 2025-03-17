import { Response, NextFunction } from "express";
import logger from "../../utils/logger";
import { AppError, ValidationError } from "../../utils/AppError";
import { AuthenticatedRequest } from "../../types/express";
import {
  getUserDetailsService,
  getUserPortfolioService,
} from "../../services/User/userService";

export const getUserDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError("User not authenticated");
    }
    const userId = req.user.id;
    const response = await getUserDetailsService(userId);
    logger.info("GET /api/user/details - Success");
    res.status(200).json(response);
  } catch (error: any) {
    logger.error(`GET /api/user/details - Error: ${error.message}`);
    next(new AppError(error.message, error.status || 500));
  }
};

export const getUserPortfolio = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError("User not authenticated");
    }
    const userId = req.user.id;
    const response = await getUserPortfolioService(userId);
    logger.info("GET /api/user/portfolio - Success");
    res.status(200).json(response);
  } catch (error: any) {
    logger.error(`GET /api/user/portfolio - Error: ${error.message}`);
    next(new AppError(error.message, error.status || 500));
  }
};
