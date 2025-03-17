import { Request } from "express";

// ✅ Extend Express Request to Include `user`
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}
