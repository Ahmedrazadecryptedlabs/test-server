import { Connection } from "@solana/web3.js";
require("dotenv").config();

export const PORT = process.env.PORT as string;
export const APP_PASSWORD = process.env.APP_PASSWORD as string;
export const NODE_ENV = process.env.NODE_ENV as string;
export const MONGO_URI = process.env.MONGO_URI as string;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
export const RESET_PASSWORD_SECRET = process.env
  .RESET_PASSWORD_SECRET as string;
export const EMAIL_VERIFICATION_SECRET = process.env
  .EMAIL_VERIFICATION_SECRET as string;
export const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET as string;
export const ACCESS_TOKEN_DURATION = 900; //15 minutes
export const REFRESH_TOKEN_DURATION = 604800; //7 days
export const ONE_WEEK_DURATION = 604800; //7 days
export const validExchanges = ["raydium", "jupiter"];

const endpoint =
  "https://falling-maximum-star.solana-mainnet.quiknode.pro/1cd1bbeb37e123d8aad7d47d4715772e4a66c03f";

export const APP_CONNECTION = new Connection(endpoint, "confirmed");
export const RAYDIUM_ADDRESS = "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R";
export const RAY_SOL_FARM_ADDRESS = "4EwbZo8BZXP5313z5A2H11MRBP15M5n6YxfmkjXESKAW";
export const RAYDIUM_STAKE_ADDRESS = "BZ2tS9ZUJBB9z4yKk1jhaEp1AT39F5zR8Vrgzmz5Buwo";
