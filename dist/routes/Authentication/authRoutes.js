"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../../controllers/Authentication/authController");
const router = express_1.default.Router();
// Authentication Routes
router.post("/register", authController_1.registerUser);
router.post("/login", authController_1.loginUser);
router.post("/logout", authController_1.logoutUser);
router.post("/refresh-access-token", authController_1.refreshAccessToken);
router.post("/send-verification-email", authController_1.sendVerificationEmail);
router.patch("/verify-email", authController_1.verifyEmail);
// Password Reset Routes
router.post("/request-password-reset", authController_1.requestPasswordReset);
router.post("/reset-password", authController_1.resetPassword);
exports.default = router;
