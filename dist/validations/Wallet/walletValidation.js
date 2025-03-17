"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importWalletSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// ✅ Validation schema for importing a Solana wallet (requires private key)
const importWalletSchema = joi_1.default.object({
    privateKey: joi_1.default.string().base64().required().messages({
        "string.empty": "Private key is required.",
        "string.base64": "Invalid private key format. It must be base64-encoded.",
    }),
});
exports.importWalletSchema = importWalletSchema;
