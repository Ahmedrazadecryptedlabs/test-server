import { Response, NextFunction } from "express";
import logger from "../../utils/logger";
import { AppError, ValidationError } from "../../utils/AppError";
import {
  createSolanaWalletService,
  // getSolanaWalletService,
  importSolanaWalletService,
} from "../../services/Wallet/walletService";
import { AuthenticatedRequest } from "../../types/express";

// ✅ Create Solana Wallet Controller
export const createSolanaWallet = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError("User not authenticated");
    }
    const userId = req.user.id;
    const response = await createSolanaWalletService(userId);

    logger.info("POST /api/wallet/create - Success");
    res.status(201).json(response);
  } catch (error: any) {
    logger.error(`POST /api/wallet/create - Error: ${error.message}`);
    next(new AppError(error.message, error.status || 500));
  }
};

// ✅ Import Solana Wallet Controller
export const importSolanaWallet = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError("User not authenticated");
    }
    const userId = req.user.id; // Assuming authentication middleware adds `req.user`
    const { privateKey } = req.body;

    const response = await importSolanaWalletService(userId, privateKey);

    logger.info("POST /api/wallet/import - Success");
    res.status(200).json(response);
  } catch (error: any) {
    logger.error(`POST /api/wallet/import - Error: ${error.message}`);
    next(new AppError(error.message, error.status || 500));
  }
};

// ✅ Get Solana Wallet Address Controller
// export const getSolanaWallet = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     if (!req.user) {
//       throw new ValidationError("User not authenticated");
//     }

//     const response = await getSolanaWalletService(req.user.id);

//     logger.info("GET /api/wallet - Success");
//     res.status(200).json(response);
//   } catch (error: any) {
//     logger.error(`GET /api/wallet - Error: ${error.message}`);
//     next(new AppError(error.message, error.status || 500));
//   }
// };
