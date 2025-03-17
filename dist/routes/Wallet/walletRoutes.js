"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const walletController_1 = require("../../controllers/Wallet/walletController");
const router = express_1.default.Router();
router.post("/create", authMiddleware_1.protect, walletController_1.createSolanaWallet);
router.post("/import", authMiddleware_1.protect, walletController_1.importSolanaWallet);
// router.get("/", protect, getSolanaWallet);
exports.default = router;
