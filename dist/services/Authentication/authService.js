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
exports.verifyEmailService = exports.sendVerificationEmailService = exports.resetPasswordService = exports.requestPasswordResetService = exports.refreshAccessTokenService = exports.loginUserService = exports.registerUserService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailgen_1 = __importDefault(require("mailgen"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const JWTTokenHelper_1 = require("../../utils/JWTTokenHelper");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../../utils/AppError");
const constants_1 = require("../../constants");
const __1 = require("../..");
// ✅ Register Service
const registerUserService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ name, email, password, }) {
    // Check if a user with the given email already exists
    const existingUser = yield userModel_1.default.findOne({ email });
    if (existingUser) {
        if (!existingUser.isVerified) {
            // Generate reset token (valid for 15 minutes)
            const response = _sendVerificationEmail(existingUser);
            return response;
        }
        throw new AppError_1.ConflictError("User already exists. Please login.");
    }
    // Create the user if one doesn't exist
    const user = yield userModel_1.default.create({ name, email, password });
    if (!user) {
        throw new AppError_1.ValidationError("User registration failed");
    }
    return {
        message: "User Registered Successfully",
        email: user.email,
    };
});
exports.registerUserService = registerUserService;
// ✅ Login Service
const loginUserService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const user = yield userModel_1.default.findOne({ email });
    if (!user) {
        throw new AppError_1.NotFoundError("User not found. Please register first.");
    }
    if (!user.isVerified) {
        throw new AppError_1.ValidationError("User not verified.");
    }
    // Check password validity
    const isPasswordCorrect = yield user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new AppError_1.UnauthorizedError("Invalid email or password.");
    }
    // Generate tokens
    const accessToken = (0, JWTTokenHelper_1.generateAccessToken)(user._id.toString());
    const refreshToken = (0, JWTTokenHelper_1.generateRefreshToken)(user._id.toString());
    return {
        message: "User Logged in Successfully",
        email: user.email,
        accessToken,
        refreshToken,
    };
});
exports.loginUserService = loginUserService;
// ✅ Refresh Access Token Service
const refreshAccessTokenService = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify refresh token
    const decoded = jsonwebtoken_1.default.verify(refreshToken, constants_1.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            throw new AppError_1.UnauthorizedError("Invalid refresh token."); // Handle invalid refresh token
        }
        return decoded;
    });
    const user = yield userModel_1.default.findById(decoded.id);
    if (!user) {
        throw new AppError_1.NotFoundError("User not found.");
    }
    // Generate new access token
    const newAccessToken = (0, JWTTokenHelper_1.generateAccessToken)(user._id.toString());
    return {
        message: "Access token refreshed successfully.",
        accessToken: newAccessToken,
    };
});
exports.refreshAccessTokenService = refreshAccessTokenService;
// ✅ Request Password Reset Service (Step 1)
const requestPasswordResetService = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findOne({ email });
    if (!user) {
        throw new AppError_1.NotFoundError("User with this email does not exist.");
    }
    // Generate reset token (valid for 15 minutes)
    const resetToken = jsonwebtoken_1.default.sign({ id: user._id }, constants_1.RESET_PASSWORD_SECRET, {
        expiresIn: "15m",
    });
    let resetPasswordContent = {
        body: {
            name: user.name,
            intro: `Thank you for registering! Please verify your email address by clicking the link below:`,
            action: {
                instructions: `Click the button below to verify your email address.`,
                button: {
                    color: "#22BC66",
                    text: "Verify Email",
                    link: `${__1.frontend_url}/auth/verify-email/${resetToken}`, // Email verification link
                },
            },
            outro: "We're excited to have you on board. Enjoy our AI-driven solutions!",
        },
    };
    sendMail(user.email, resetPasswordContent);
    return {
        message: "Password reset link has been sent to your email.",
    };
});
exports.requestPasswordResetService = requestPasswordResetService;
// ✅ Reset Password Service (Step 2)
const resetPasswordService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { resetToken, newPassword } = payload;
    // Verify resetToken
    const decoded = jsonwebtoken_1.default.verify(resetToken, constants_1.RESET_PASSWORD_SECRET, (err, decoded) => {
        if (err) {
            throw new AppError_1.UnauthorizedError("Invalid reset token."); // Handle invalid reset token
        }
        return decoded;
    });
    const user = yield userModel_1.default.findById(decoded.id);
    if (!user) {
        throw new AppError_1.NotFoundError("User not found.");
    }
    // Check if new password is the same as the old password
    const isOldPassword = yield user.comparePassword(newPassword);
    if (isOldPassword) {
        throw new AppError_1.ValidationError("New password cannot be the same as the old password.");
    }
    user.password = newPassword;
    // Save updated password
    yield user.save();
    return { message: "Password has been reset successfully." };
});
exports.resetPasswordService = resetPasswordService;
const sendVerificationEmailService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = payload;
    const user = yield userModel_1.default.findOne({ email });
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    if (user.isVerified) {
        throw new AppError_1.ConflictError("User is already verified.");
    }
    const response = _sendVerificationEmail(user);
    return response;
});
exports.sendVerificationEmailService = sendVerificationEmailService;
const verifyEmailService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { verifyEmailToken } = payload;
    const decoded = jsonwebtoken_1.default.verify(verifyEmailToken, constants_1.EMAIL_VERIFICATION_SECRET, (err, decoded) => {
        if (err) {
            throw new AppError_1.UnauthorizedError("Invalid verification token.");
        }
        return decoded;
    });
    // Find the user based on the id from the decoded token
    const user = yield userModel_1.default.findById(decoded.id);
    if (!user) {
        throw new AppError_1.NotFoundError("User not found.");
    }
    if (user.isVerified) {
        throw new AppError_1.ConflictError("User is already verified.");
    }
    // Update the user's verification status
    user.isVerified = true;
    yield user.save();
    return {
        message: "Email has been verified successfully.",
        email: user.email,
    };
});
exports.verifyEmailService = verifyEmailService;
const sendMail = (recipient, content) => {
    // Configure email transport settings
    let config = {
        service: "gmail",
        auth: {
            user: "uf80902@gmail.com",
            pass: constants_1.APP_PASSWORD, // Use process.env.PASSWORD as a string
        },
    };
    // Create the transporter using nodemailer
    let transporter = nodemailer_1.default.createTransport(config);
    // Initialize the Mailgen mail generator
    let MailGenerator = new mailgen_1.default({
        theme: "default",
        product: {
            name: "Hedge AI",
            link: "https://hedgeai.com/",
        },
    });
    // Generate the HTML content of the email
    let mail = MailGenerator.generate(content);
    // Prepare the message to be sent
    let message = {
        from: "uf80902@gmail.com",
        to: recipient,
        subject: "Password Reset Request",
        html: mail,
    };
    // Send the email
    transporter
        .sendMail(message)
        .then(() => {
        console.log("Email sent successfully");
    })
        .catch((error) => {
        console.log("ERROR", error);
    });
};
const _sendVerificationEmail = (user) => {
    // Generate reset token (valid for 15 minutes)
    const emailVerificationToken = jsonwebtoken_1.default.sign({ id: user._id }, constants_1.EMAIL_VERIFICATION_SECRET, {
        expiresIn: "15m",
    });
    const emailVerificationContent = {
        body: {
            name: user.name,
            intro: "Thank you for registering! Please verify your email address by clicking the link below:",
            action: {
                instructions: "Click the button below to verify your email address.",
                button: {
                    color: "#22BC66",
                    text: "Verify Email",
                    link: `${__1.frontend_url}/auth/confirm-email/${emailVerificationToken}`,
                },
            },
            outro: "We're excited to have you on board. Enjoy our AI-driven solutions!",
        },
    };
    sendMail(user.email, emailVerificationContent);
    return {
        message: "Verification link has been sent to your email.",
        email: user.email,
    };
};
