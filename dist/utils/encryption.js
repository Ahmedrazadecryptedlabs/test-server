"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptPrivateKey = exports.encryptPrivateKey = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const constants_1 = require("../constants");
// ✅ Encrypt Private Key
const encryptPrivateKey = (privateKey) => {
    // Get encryption key from environment variables
    return crypto_js_1.default.AES.encrypt(privateKey, constants_1.ENCRYPTION_SECRET).toString();
};
exports.encryptPrivateKey = encryptPrivateKey;
// ✅ Decrypt Private Key
const decryptPrivateKey = (encryptedKey) => {
    // Get encryption key from environment variables
    const bytes = crypto_js_1.default.AES.decrypt(encryptedKey, constants_1.ENCRYPTION_SECRET);
    return bytes.toString(crypto_js_1.default.enc.Utf8);
};
exports.decryptPrivateKey = decryptPrivateKey;
