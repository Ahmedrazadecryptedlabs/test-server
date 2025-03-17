import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../constants";

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m", // ✅ Short expiry for access token
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d", // ✅ Long expiry for refresh token
  });
};
