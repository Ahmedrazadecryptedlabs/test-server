import express from "express";
import { protect } from "../../middlewares/authMiddleware";
import {
  createSolanaWallet,
  // getSolanaWallet,
  importSolanaWallet,
} from "../../controllers/Wallet/walletController";

const router = express.Router();

router.post("/create", protect, createSolanaWallet);
router.post("/import", protect, importSolanaWallet);
// router.get("/", protect, getSolanaWallet);

export default router;
