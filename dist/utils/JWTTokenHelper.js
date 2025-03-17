"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../constants");
const generateAccessToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, constants_1.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m", // ✅ Short expiry for access token
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, constants_1.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d", // ✅ Long expiry for refresh token
    });
};
exports.generateRefreshToken = generateRefreshToken;
