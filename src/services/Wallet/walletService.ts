import { Keypair } from "@solana/web3.js";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../utils/AppError";
import { encryptPrivateKey } from "../../utils/encryption";
import User from "../../models/userModel";
import { WalletResponse } from "./DTO";
import bs58 from "bs58"; // Add this import at the top

// ✅ Create a new Solana wallet for the user
export const createSolanaWalletService = async (
  userId: string
): Promise<WalletResponse> => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found.");

  // ✅ Prevent duplicate wallet creation
  if (user.solanaWallet && user.solanaWallet.address) {
    throw new ConflictError("Wallet already exists.");
  }

  // Generate a new Solana wallet
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  const secretKey = keypair.secretKey;
  // Convert secret key to base58 for storage (Solana standard)
  const base58PrivateKey = bs58.encode(secretKey);
  // Encrypt the private key before saving (You might want to use encryption)
  const encryptedPrivateKey = encryptPrivateKey(base58PrivateKey);

  // Update user wallet details
  user.solanaWallet = {
    address: publicKey,
    encryptedPrivateKey,
  };
  await user.save();

  return {
    message: "Solana wallet created successfully.",
    wallet: {
      address: publicKey,
    },
  };
};

// ✅ Import an existing Solana wallet using private key
export const importSolanaWalletService = async (
  userId: string,
  privateKey: string
): Promise<WalletResponse> => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found.");

  // ✅ Prevent duplicate wallet import
  if (user.solanaWallet && user.solanaWallet.address) {
    throw new ConflictError("Wallet already exists.");
  }

  // Decode the provided private key from base58 format
  let decodedSecretKey;
  try {
    decodedSecretKey = bs58.decode(privateKey); // Use bs58 for decoding
  } catch (error) {
    throw new ValidationError("Invalid private key format.");
  }

  // Check if the decoded secret key has the expected length
  if (decodedSecretKey.length !== 64) {
    throw new ValidationError(
      "Bad secret key size. Ensure the private key is correct."
    );
  }

  // Generate the keypair from the existing private key
  const keypair = Keypair.fromSecretKey(decodedSecretKey);
  const publicKey = keypair.publicKey.toBase58();

  // Encrypt private key before saving
  const encryptedPrivateKey = encryptPrivateKey(privateKey);

  // Update user wallet details
  user.solanaWallet = {
    address: publicKey,
    encryptedPrivateKey,
  };
  await user.save();

  return {
    message: "Solana wallet imported successfully.",
    wallet: {
      address: publicKey,
    },
  };
};

// ✅ Get Solana Wallet Address Service
// export const getSolanaWalletService = async (
//   userId: string
// ): Promise<WalletResponse> => {
//   const user = await User.findById(userId);
//   if (!user) throw new NotFoundError("User not found.");

//   // Check if the user has a Solana wallet
//   if (!user.solanaWallet || !user.solanaWallet.address) {
//     return {
//       message: "Wallet not found.",
//       wallet: null, // Returning null here instead of an empty object
//     };
//   }

//   return {
//     message: "Solana wallet retrieved successfully.",
//     wallet: {
//       address: user.solanaWallet.address,
//     },
//   };
// };
