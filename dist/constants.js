"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAYDIUM_STAKE_ADDRESS = exports.RAY_SOL_FARM_ADDRESS = exports.RAYDIUM_ADDRESS = exports.APP_CONNECTION = exports.validExchanges = exports.ONE_WEEK_DURATION = exports.REFRESH_TOKEN_DURATION = exports.ACCESS_TOKEN_DURATION = exports.ENCRYPTION_SECRET = exports.EMAIL_VERIFICATION_SECRET = exports.RESET_PASSWORD_SECRET = exports.REFRESH_TOKEN_SECRET = exports.ACCESS_TOKEN_SECRET = exports.MONGO_URI = exports.NODE_ENV = exports.APP_PASSWORD = exports.PORT = void 0;
const web3_js_1 = require("@solana/web3.js");
require("dotenv").config();
exports.PORT = process.env.PORT;
exports.APP_PASSWORD = process.env.APP_PASSWORD;
exports.NODE_ENV = process.env.NODE_ENV;
exports.MONGO_URI = process.env.MONGO_URI;
exports.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
exports.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
exports.RESET_PASSWORD_SECRET = process.env
    .RESET_PASSWORD_SECRET;
exports.EMAIL_VERIFICATION_SECRET = process.env
    .EMAIL_VERIFICATION_SECRET;
exports.ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;
exports.ACCESS_TOKEN_DURATION = 900; //15 minutes
exports.REFRESH_TOKEN_DURATION = 604800; //7 days
exports.ONE_WEEK_DURATION = 604800; //7 days
exports.validExchanges = ["raydium", "jupiter"];
const endpoint = "https://falling-maximum-star.solana-mainnet.quiknode.pro/1cd1bbeb37e123d8aad7d47d4715772e4a66c03f";
exports.APP_CONNECTION = new web3_js_1.Connection(endpoint, "confirmed");
exports.RAYDIUM_ADDRESS = "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R";
exports.RAY_SOL_FARM_ADDRESS = "4EwbZo8BZXP5313z5A2H11MRBP15M5n6YxfmkjXESKAW";
exports.RAYDIUM_STAKE_ADDRESS = "BZ2tS9ZUJBB9z4yKk1jhaEp1AT39F5zR8Vrgzmz5Buwo";
