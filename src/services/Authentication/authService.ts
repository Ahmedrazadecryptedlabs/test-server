import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import User, { IUser } from "../../models/userModel";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/JWTTokenHelper";
import {
  EmailContent,
  EmailVerificationResponse,
  LoginPayload,
  LoginUserResponse,
  RefreshAccessTokenResponse,
  RegisterPayload,
  RegisterUserResponse,
  RequestPasswordResetResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from "./DTO";
import jwt from "jsonwebtoken";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../utils/AppError";
import {
  APP_PASSWORD,
  EMAIL_VERIFICATION_SECRET,
  REFRESH_TOKEN_SECRET,
  RESET_PASSWORD_SECRET,
} from "../../constants";
import { frontend_url } from "../..";

// ✅ Register Service
export const registerUserService = async ({
  name,
  email,
  password,
}: RegisterPayload): Promise<RegisterUserResponse> => {
  // Check if a user with the given email already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (!existingUser.isVerified) {
      // Generate reset token (valid for 15 minutes)
      const response = _sendVerificationEmail(existingUser);

      return response;
    }

    throw new ConflictError("User already exists. Please login.");
  }

  // Create the user if one doesn't exist
  const user = await User.create({ name, email, password });
  if (!user) {
    throw new ValidationError("User registration failed");
  }

  return {
    message: "User Registered Successfully",
    email: user.email,
  };
};

// ✅ Login Service
export const loginUserService = async (
  payload: LoginPayload
): Promise<LoginUserResponse> => {
  const { email, password } = payload;

  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError("User not found. Please register first.");
  }
  if (!user.isVerified) {
    throw new ValidationError("User not verified.");
  }

  // Check password validity
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  return {
    message: "User Logged in Successfully",
    email: user.email,
    accessToken,
    refreshToken,
  };
};

// ✅ Refresh Access Token Service
export const refreshAccessTokenService = async (
  refreshToken: string
): Promise<RefreshAccessTokenResponse> => {
  // Verify refresh token
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
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new NotFoundError("User not found.");
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(user._id.toString());

  return {
    message: "Access token refreshed successfully.",
    accessToken: newAccessToken,
  };
};

// ✅ Request Password Reset Service (Step 1)
export const requestPasswordResetService = async (
  email: string
): Promise<RequestPasswordResetResponse> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError("User with this email does not exist.");
  }

  // Generate reset token (valid for 15 minutes)
  const resetToken = jwt.sign({ id: user._id }, RESET_PASSWORD_SECRET, {
    expiresIn: "15m",
  });

  let resetPasswordContent = {
    body: {
      name: user.name,
      intro: `Thank you for registering! Please verify your email address by clicking the link below:`,
      action: {
        instructions: `Click the button below to verify your email address.`,
        button: {
          color: "#22BC66",
          text: "Verify Email",
          link: `${frontend_url}/auth/verify-email/${resetToken}`, // Email verification link
        },
      },
      outro:
        "We're excited to have you on board. Enjoy our AI-driven solutions!",
    },
  };

  sendMail(user.email, resetPasswordContent);

  return {
    message: "Password reset link has been sent to your email.",
  };
};

// ✅ Reset Password Service (Step 2)
export const resetPasswordService = async (
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> => {
  const { resetToken, newPassword } = payload;

  // Verify resetToken
  const decoded: any = jwt.verify(
    resetToken,
    RESET_PASSWORD_SECRET,
    (err: any, decoded: any) => {
      if (err) {
        throw new UnauthorizedError("Invalid reset token."); // Handle invalid reset token
      }
      return decoded;
    }
  );
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new NotFoundError("User not found.");
  }
  // Check if new password is the same as the old password
  const isOldPassword = await user.comparePassword(newPassword);
  if (isOldPassword) {
    throw new ValidationError(
      "New password cannot be the same as the old password."
    );
  }

  user.password = newPassword;

  // Save updated password
  await user.save();

  return { message: "Password has been reset successfully." };
};

export const sendVerificationEmailService = async (payload: {
  email: string;
}): Promise<RegisterUserResponse> => {
  const { email } = payload;
  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError("User not found.");
  if (user.isVerified) {
    throw new ConflictError("User is already verified.");
  }
  const response = _sendVerificationEmail(user);
  return response;
};

export const verifyEmailService = async (payload: {
  verifyEmailToken: string;
}): Promise<EmailVerificationResponse> => {
  const { verifyEmailToken } = payload;

  const decoded: any = jwt.verify(
    verifyEmailToken,
    EMAIL_VERIFICATION_SECRET,
    (err: any, decoded: any) => {
      if (err) {
        throw new UnauthorizedError("Invalid verification token.");
      }
      return decoded;
    }
  );

  // Find the user based on the id from the decoded token
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new NotFoundError("User not found.");
  }

  if (user.isVerified) {
    throw new ConflictError("User is already verified.");
  }

  // Update the user's verification status
  user.isVerified = true;
  await user.save();

  return {
    message: "Email has been verified successfully.",
    email: user.email,
  };
};

const sendMail = (recipient: string, content: EmailContent): void => {
  // Configure email transport settings
  let config = {
    service: "gmail",
    auth: {
      user: "uf80902@gmail.com",
      pass: APP_PASSWORD, // Use process.env.PASSWORD as a string
    },
  };

  // Create the transporter using nodemailer
  let transporter = nodemailer.createTransport(config);

  // Initialize the Mailgen mail generator
  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Hedge AI",
      link: "https://hedgeai.com/",
    },
  });

  // Generate the HTML content of the email
  let mail = MailGenerator.generate(content);

  // Prepare the message to be sent
  let message = {
    from: "uf80902@gmail.com",
    to: recipient,
    subject: "Password Reset Request",
    html: mail,
  };

  // Send the email
  transporter
    .sendMail(message)
    .then(() => {
      console.log("Email sent successfully");
    })
    .catch((error: Error) => {
      console.log("ERROR", error);
    });
};

const _sendVerificationEmail = (user: IUser) => {
  // Generate reset token (valid for 15 minutes)
  const emailVerificationToken = jwt.sign(
    { id: user._id },
    EMAIL_VERIFICATION_SECRET,
    {
      expiresIn: "15m",
    }
  );

  const emailVerificationContent: EmailContent = {
    body: {
      name: user.name,
      intro:
        "Thank you for registering! Please verify your email address by clicking the link below:",
      action: {
        instructions: "Click the button below to verify your email address.",
        button: {
          color: "#22BC66",
          text: "Verify Email",
          link: `${frontend_url}/auth/confirm-email/${emailVerificationToken}`,
        },
      },
      outro:
        "We're excited to have you on board. Enjoy our AI-driven solutions!",
    },
  };

  sendMail(user.email, emailVerificationContent);

  return {
    message: "Verification link has been sent to your email.",
    email: user.email,
  };
};
