import { UserDetailsResponse, UserPortfolioResponse } from "./DTO";
import { BadGateWayError, NotFoundError } from "../../utils/AppError";
import User from "../../models/userModel";
import axios from "axios";

// ✅ Get User Details Service
export const getUserDetailsService = async (
  userId: string
): Promise<UserDetailsResponse> => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found.");
  return {
    message: "User details fetched successfully.",
    user: {
      name: user.name,
      email: user.email,
      walletAddress: user.solanaWallet ? user.solanaWallet.address : null,
    },
  };
};

export const getUserPortfolioService = async (
  userId: string
): Promise<UserPortfolioResponse> => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found.");
  const walletAddress = user.solanaWallet?.address;
  if (!walletAddress) {
    throw new NotFoundError("Wallet not exists.");
  }
  const apiUrl = `https://portfolio-api-jup-pos.sonar.watch/v1/portfolio/fetchJup?address=${walletAddress}&addressSystem=solana`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new BadGateWayError("Failed to fetch the user portfolio details.");
  }
  const data = await response.json();

  // The tokenInfo object containing token details
  const tokenInfo = data.tokenInfo.solana;

  // Extracting assets and mapping their address to the symbol from tokenInfo
  const assets = data.elements.flatMap((element: any) =>
    element.data.assets.map((asset: any) => {
      const assetAddress = asset.data.address;
      const token = tokenInfo[assetAddress];

      // Get the symbol from tokenInfo or fallback to 'Unknown'
      const symbol = token ? token.symbol : "Unknown";

      return {
        symbol: symbol, // Use symbol from tokenInfo
        balance: asset.data.amount.toString(), // Convert balance to string
      };
    })
  );
  return {
    message: "User details fetched successfully.",
    assets: assets,
  };
};
