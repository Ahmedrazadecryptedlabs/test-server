import express from "express";
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  refreshAccessToken,
  logoutUser,
  sendVerificationEmail,
  verifyEmail,
} from "../../controllers/Authentication/authController";

const router = express.Router();

// Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-access-token", refreshAccessToken);
router.post("/send-verification-email", sendVerificationEmail);
router.patch("/verify-email", verifyEmail);

// Password Reset Routes
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;
