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
exports.getUserPortfolioService = exports.getUserDetailsService = void 0;
const AppError_1 = require("../../utils/AppError");
const userModel_1 = __importDefault(require("../../models/userModel"));
// ✅ Get User Details Service
const getUserDetailsService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findById(userId);
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    return {
        message: "User details fetched successfully.",
        user: {
            name: user.name,
            email: user.email,
            walletAddress: user.solanaWallet ? user.solanaWallet.address : null,
        },
    };
});
exports.getUserDetailsService = getUserDetailsService;
const getUserPortfolioService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield userModel_1.default.findById(userId);
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    const walletAddress = (_a = user.solanaWallet) === null || _a === void 0 ? void 0 : _a.address;
    if (!walletAddress) {
        throw new AppError_1.NotFoundError("Wallet not exists.");
    }
    const apiUrl = `https://portfolio-api-jup-pos.sonar.watch/v1/portfolio/fetchJup?address=${walletAddress}&addressSystem=solana`;
    const response = yield fetch(apiUrl);
    if (!response.ok) {
        throw new AppError_1.BadGateWayError("Failed to fetch the user portfolio details.");
    }
    const data = yield response.json();
    // The tokenInfo object containing token details
    const tokenInfo = data.tokenInfo.solana;
    // Extracting assets and mapping their address to the symbol from tokenInfo
    const assets = data.elements.flatMap((element) => element.data.assets.map((asset) => {
        const assetAddress = asset.data.address;
        const token = tokenInfo[assetAddress];
        // Get the symbol from tokenInfo or fallback to 'Unknown'
        const symbol = token ? token.symbol : "Unknown";
        return {
            symbol: symbol, // Use symbol from tokenInfo
            balance: asset.data.amount.toString(), // Convert balance to string
        };
    }));
    return {
        message: "User details fetched successfully.",
        assets: assets,
    };
});
exports.getUserPortfolioService = getUserPortfolioService;
