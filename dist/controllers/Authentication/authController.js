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
exports.logoutUser = exports.verifyEmail = exports.sendVerificationEmail = exports.resetPassword = exports.requestPasswordReset = exports.refreshAccessToken = exports.loginUser = exports.registerUser = void 0;
const AppError_1 = require("../../utils/AppError");
const logger_1 = __importDefault(require("../../utils/logger"));
const validatePayload_1 = __importDefault(require("../../utils/validatePayload"));
const authValidation_1 = require("../../validations/Authentication/authValidation");
const authService_1 = require("../../services/Authentication/authService");
const constants_1 = require("../../constants");
// ✅ Register Controller
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validatePayload_1.default)(authValidation_1.registerSchema, req.body);
        const response = yield (0, authService_1.registerUserService)(req.body);
        logger_1.default.info("POST /api/auth/register - Success");
        res.status(201).json(response);
    }
    catch (error) {
        logger_1.default.error(`POST /api/auth/register - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.registerUser = registerUser;
// ✅ Login Controller
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validatePayload_1.default)(authValidation_1.loginSchema, req.body);
        const response = yield (0, authService_1.loginUserService)(req.body);
        res.cookie("accessToken", response.accessToken, {
            httpOnly: true, // Accessible only by the web server
            secure: constants_1.NODE_ENV === "production",
            sameSite: "none",
            maxAge: constants_1.ACCESS_TOKEN_DURATION * 1000,
        });
        // Set refresh token in cookie
        res.cookie("refreshToken", response.refreshToken, {
            httpOnly: true, // Accessible only by the web server
            secure: constants_1.NODE_ENV === "production",
            sameSite: "none",
            maxAge: constants_1.REFRESH_TOKEN_DURATION * 1000, // Expires after the given time in milliseconds
        });
        logger_1.default.info("POST /api/auth/login - Success");
        res.status(200).json({ message: response.message, email: response.email });
    }
    catch (error) {
        logger_1.default.error(`POST /api/auth/login - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.loginUser = loginUser;
// ✅ Refresh Access Token Controller
const refreshAccessToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookies = req.cookies;
        if (!cookies) {
            throw new AppError_1.ValidationError("No cookies found.");
        }
        const refreshToken = cookies === null || cookies === void 0 ? void 0 : cookies.refreshToken;
        if (!refreshToken) {
            throw new AppError_1.UnauthorizedError("Session expired. Please login again.");
        }
        const response = yield (0, authService_1.refreshAccessTokenService)(refreshToken);
        logger_1.default.info("POST /api/auth/refresh-token - Success");
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`POST /api/auth/refresh-token - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.refreshAccessToken = refreshAccessToken;
// ✅ Request Password Reset Controller
const requestPasswordReset = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validatePayload_1.default)(authValidation_1.requestPasswordResetSchema, req.body);
        const response = yield (0, authService_1.requestPasswordResetService)(req.body.email);
        logger_1.default.info("POST /api/auth/request-password-reset - Success");
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`POST /api/auth/request-password-reset - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.requestPasswordReset = requestPasswordReset;
// ✅ Reset Password Controller
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validatePayload_1.default)(authValidation_1.resetPasswordSchema, req.body);
        const response = yield (0, authService_1.resetPasswordService)(req.body);
        logger_1.default.info("POST /api/auth/reset-password - Success");
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`POST /api/auth/reset-password - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.resetPassword = resetPassword;
// ✅ Send Email Verification Controller
const sendVerificationEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validatePayload_1.default)(authValidation_1.sendEmailVerificationSchema, req.body);
        const response = yield (0, authService_1.sendVerificationEmailService)(req.body);
        logger_1.default.info("POST /api/auth/send-verification-email - Success");
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`POST /api/auth/send-verification-email - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
const verifyEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validatePayload_1.default)(authValidation_1.verifyEmailSchema, req.body);
        const response = yield (0, authService_1.verifyEmailService)(req.body);
        logger_1.default.info("POST /api/auth/verify-email - Success");
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`POST /api/auth/verify-email - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.verifyEmail = verifyEmail;
// ✅ Logout Controller
const logoutUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Clear the accessToken cookie
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: constants_1.NODE_ENV === "production",
            sameSite: "none",
        });
        // Clear the refreshToken cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: constants_1.NODE_ENV === "production",
            sameSite: "none",
        });
        logger_1.default.info("POST /api/auth/logout - Success");
        // Send a success response
        res.status(200).json({ message: "User logged out successfully." });
    }
    catch (error) {
        logger_1.default.error(`POST /api/auth/logout - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.logoutUser = logoutUser;
