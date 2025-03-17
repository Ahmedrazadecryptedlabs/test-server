import Joi from "joi";

// ✅ Validation schema for importing a Solana wallet (requires private key)
const importWalletSchema = Joi.object({
  privateKey: Joi.string().base64().required().messages({
    "string.empty": "Private key is required.",
    "string.base64": "Invalid private key format. It must be base64-encoded.",
  }),
});

export { importWalletSchema };
