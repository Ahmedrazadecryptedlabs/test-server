"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importSolanaWallet = exports.createSolanaWallet = void 0;
const logger_1 = __importDefault(require("../../utils/logger"));
const AppError_1 = require("../../utils/AppError");
const walletService_1 = require("../../services/Wallet/walletService");
// ✅ Create Solana Wallet Controller
const createSolanaWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            throw new AppError_1.ValidationError("User not authenticated");
        }
        const userId = req.user.id;
        const response = yield (0, walletService_1.createSolanaWalletService)(userId);
        logger_1.default.info("POST /api/wallet/create - Success");
        res.status(201).json(response);
    }
    catch (error) {
        logger_1.default.error(`POST /api/wallet/create - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.createSolanaWallet = createSolanaWallet;
// ✅ Import Solana Wallet Controller
const importSolanaWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            throw new AppError_1.ValidationError("User not authenticated");
        }
        const userId = req.user.id; // Assuming authentication middleware adds `req.user`
        const { privateKey } = req.body;
        const response = yield (0, walletService_1.importSolanaWalletService)(userId, privateKey);
        logger_1.default.info("POST /api/wallet/import - Success");
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`POST /api/wallet/import - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.importSolanaWallet = importSolanaWallet;
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
