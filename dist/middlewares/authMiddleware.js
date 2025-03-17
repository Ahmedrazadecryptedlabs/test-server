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
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const constants_1 = require("../constants");
const AppError_1 = require("../utils/AppError");
const JWTTokenHelper_1 = require("../utils/JWTTokenHelper");
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookies = req.cookies;
        if (!cookies) {
            throw new AppError_1.ValidationError("No cookies found.");
        }
        const refreshToken = cookies === null || cookies === void 0 ? void 0 : cookies.refreshToken;
        let accessToken = cookies === null || cookies === void 0 ? void 0 : cookies.accessToken;
        let userId;
        if (!refreshToken) {
            throw new AppError_1.UnauthorizedError("Session expired. Please login again.");
        }
        if (!accessToken) {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, constants_1.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    throw new AppError_1.UnauthorizedError("Invalid refresh token."); // Handle invalid refresh token
                }
                return decoded;
            });
            userId = decoded.id;
            accessToken = (0, JWTTokenHelper_1.generateAccessToken)(userId);
            res.cookie("accessToken", accessToken, {
                httpOnly: true, // Accessible only by the web server
                secure: constants_1.NODE_ENV === "production",
                sameSite: "none",
                maxAge: constants_1.ACCESS_TOKEN_DURATION * 1000,
            });
        }
        else {
            const decoded = jsonwebtoken_1.default.verify(accessToken, constants_1.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    throw new AppError_1.UnauthorizedError("Invalid access token.");
                }
                return decoded;
            });
            userId = decoded.id;
        }
        const user = yield userModel_1.default.findById(userId).select("_id");
        if (!user) {
            throw new AppError_1.NotFoundError("User not found.");
        }
        req.user = { id: user._id.toString() };
        next();
    }
    catch (error) {
        console.log("🚀 ~ error.message, error.status :", error.message, error.status);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.protect = protect;
