import Joi from "joi";

// ================== AUTHENTICATION VALIDATION ==================

// ✅ Register Schema with Custom Messages
const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Name is required.",
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name cannot exceed 30 characters.",
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email address.",
  }),

  password: Joi.string()
    .min(7)
    .pattern(new RegExp("^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{7,}$"))
    .required()
    .messages({
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 7 characters long.",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one special character, and one number.",
    }),
});

// ✅ Login Schema with Custom Messages
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email address.",
  }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
  }),
});

// ✅ Request Password Reset Schema (User provides email)
const requestPasswordResetSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email address.",
  }),
});

const sendEmailVerificationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email address.",
  }),
});

// ✅ Reset Password Schema (User provides new password & reset token)
const resetPasswordSchema = Joi.object({
  resetToken: Joi.string().required().messages({
    "string.empty": "Reset token is required.",
  }),

  newPassword: Joi.string()
    .min(7)
    .pattern(new RegExp("^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{7,}$"))
    .required()
    .messages({
      "string.empty": "New password is required.",
      "string.min": "Password must be at least 7 characters long.",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one special character, and one number.",
    }),
});
const verifyEmailSchema = Joi.object({
  verifyEmailToken: Joi.string().required().messages({
    "string.empty": "Verification token is required.",
  }),
});

export {
  registerSchema,
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  sendEmailVerificationSchema,
  verifyEmailSchema,
};
