"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailSchema = exports.sendEmailVerificationSchema = exports.resetPasswordSchema = exports.requestPasswordResetSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// ================== AUTHENTICATION VALIDATION ==================
// ✅ Register Schema with Custom Messages
const registerSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(30).required().messages({
        "string.empty": "Name is required.",
        "string.min": "Name must be at least 3 characters long.",
        "string.max": "Name cannot exceed 30 characters.",
    }),
    email: joi_1.default.string().email().required().messages({
        "string.empty": "Email is required.",
        "string.email": "Email must be a valid email address.",
    }),
    password: joi_1.default.string()
        .min(7)
        .pattern(new RegExp("^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{7,}$"))
        .required()
        .messages({
        "string.empty": "Password is required.",
        "string.min": "Password must be at least 7 characters long.",
        "string.pattern.base": "Password must contain at least one uppercase letter, one special character, and one number.",
    }),
});
exports.registerSchema = registerSchema;
// ✅ Login Schema with Custom Messages
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.empty": "Email is required.",
        "string.email": "Email must be a valid email address.",
    }),
    password: joi_1.default.string().required().messages({
        "string.empty": "Password is required.",
    }),
});
exports.loginSchema = loginSchema;
// ✅ Request Password Reset Schema (User provides email)
const requestPasswordResetSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.empty": "Email is required.",
        "string.email": "Email must be a valid email address.",
    }),
});
exports.requestPasswordResetSchema = requestPasswordResetSchema;
const sendEmailVerificationSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.empty": "Email is required.",
        "string.email": "Email must be a valid email address.",
    }),
});
exports.sendEmailVerificationSchema = sendEmailVerificationSchema;
// ✅ Reset Password Schema (User provides new password & reset token)
const resetPasswordSchema = joi_1.default.object({
    resetToken: joi_1.default.string().required().messages({
        "string.empty": "Reset token is required.",
    }),
    newPassword: joi_1.default.string()
        .min(7)
        .pattern(new RegExp("^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{7,}$"))
        .required()
        .messages({
        "string.empty": "New password is required.",
        "string.min": "Password must be at least 7 characters long.",
        "string.pattern.base": "Password must contain at least one uppercase letter, one special character, and one number.",
    }),
});
exports.resetPasswordSchema = resetPasswordSchema;
const verifyEmailSchema = joi_1.default.object({
    verifyEmailToken: joi_1.default.string().required().messages({
        "string.empty": "Verification token is required.",
    }),
});
exports.verifyEmailSchema = verifyEmailSchema;
