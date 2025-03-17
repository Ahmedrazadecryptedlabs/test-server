import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import { AuthenticatedRequest } from "../types/express"; // Import the custom type
import {
  ACCESS_TOKEN_DURATION,
  ACCESS_TOKEN_SECRET,
  NODE_ENV,
  REFRESH_TOKEN_SECRET,
} from "../constants";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../utils/AppError";
import { generateAccessToken } from "../utils/JWTTokenHelper";

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cookies = req.cookies;
    if (!cookies) {
      throw new ValidationError("No cookies found.");
    }

    const refreshToken = cookies?.refreshToken;
    let accessToken = cookies?.accessToken;

    let userId;
    if (!refreshToken) {
      throw new UnauthorizedError("Session expired. Please login again.");
    }
    if (!accessToken) {
      const decoded: any = jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET,
        (err: any, decoded: any) => {
          if (err) {
            throw new UnauthorizedError("Invalid refresh token."); // Handle invalid refresh token
          }
          return decoded;
        }
      );
      userId = decoded.id;
      accessToken = generateAccessToken(userId);
      res.cookie("accessToken", accessToken, {
        httpOnly: true, // Accessible only by the web server
        secure: NODE_ENV === "production",
        sameSite: "none",
        maxAge: ACCESS_TOKEN_DURATION * 1000,
      });
    } else {
      const decoded: any = jwt.verify(
        accessToken,
        ACCESS_TOKEN_SECRET,
        (err: any, decoded: any) => {
          if (err) {
            throw new UnauthorizedError("Invalid access token.");
          }
          return decoded;
        }
      );
      userId = decoded.id;
    }

    const user = await User.findById(userId).select("_id");
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    req.user = { id: user._id.toString() };
    next();
  } catch (error: any) {
    console.log(
      "🚀 ~ error.message, error.status :",
      error.message,
      error.status
    );
    next(new AppError(error.message, error.status || 500));
  }
};
