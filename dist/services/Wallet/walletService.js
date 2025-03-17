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
exports.importSolanaWalletService = exports.createSolanaWalletService = void 0;
const web3_js_1 = require("@solana/web3.js");
const AppError_1 = require("../../utils/AppError");
const encryption_1 = require("../../utils/encryption");
const userModel_1 = __importDefault(require("../../models/userModel"));
const bs58_1 = __importDefault(require("bs58")); // Add this import at the top
// ✅ Create a new Solana wallet for the user
const createSolanaWalletService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findById(userId);
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    // ✅ Prevent duplicate wallet creation
    if (user.solanaWallet && user.solanaWallet.address) {
        throw new AppError_1.ConflictError("Wallet already exists.");
    }
    // Generate a new Solana wallet
    const keypair = web3_js_1.Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const secretKey = keypair.secretKey;
    // Convert secret key to base58 for storage (Solana standard)
    const base58PrivateKey = bs58_1.default.encode(secretKey);
    // Encrypt the private key before saving (You might want to use encryption)
    const encryptedPrivateKey = (0, encryption_1.encryptPrivateKey)(base58PrivateKey);
    // Update user wallet details
    user.solanaWallet = {
        address: publicKey,
        encryptedPrivateKey,
    };
    yield user.save();
    return {
        message: "Solana wallet created successfully.",
        wallet: {
            address: publicKey,
        },
    };
});
exports.createSolanaWalletService = createSolanaWalletService;
// ✅ Import an existing Solana wallet using private key
const importSolanaWalletService = (userId, privateKey) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findById(userId);
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    // ✅ Prevent duplicate wallet import
    if (user.solanaWallet && user.solanaWallet.address) {
        throw new AppError_1.ConflictError("Wallet already exists.");
    }
    // Decode the provided private key from base58 format
    let decodedSecretKey;
    try {
        decodedSecretKey = bs58_1.default.decode(privateKey); // Use bs58 for decoding
    }
    catch (error) {
        throw new AppError_1.ValidationError("Invalid private key format.");
    }
    // Check if the decoded secret key has the expected length
    if (decodedSecretKey.length !== 64) {
        throw new AppError_1.ValidationError("Bad secret key size. Ensure the private key is correct.");
    }
    // Generate the keypair from the existing private key
    const keypair = web3_js_1.Keypair.fromSecretKey(decodedSecretKey);
    const publicKey = keypair.publicKey.toBase58();
    // Encrypt private key before saving
    const encryptedPrivateKey = (0, encryption_1.encryptPrivateKey)(privateKey);
    // Update user wallet details
    user.solanaWallet = {
        address: publicKey,
        encryptedPrivateKey,
    };
    yield user.save();
    return {
        message: "Solana wallet imported successfully.",
        wallet: {
            address: publicKey,
        },
    };
});
exports.importSolanaWalletService = importSolanaWalletService;
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
