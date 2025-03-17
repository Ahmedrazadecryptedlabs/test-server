export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  resetToken: string;
  newPassword: string;
}

export interface RegisterUserResponse {
  message: string;
  email: string;
}

export interface EmailVerificationResponse {
  message: string;
  email: string;
}

export interface LoginUserResponse {
  message: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshAccessTokenResponse {
  message: string;
  accessToken: string;
}

export interface RequestPasswordResetResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

interface EmailActionButton {
  color: string;
  text: string;
  link: string;
}

interface EmailAction {
  instructions: string;
  button: EmailActionButton;
}

interface EmailBody {
  name: string;
  intro: string;
  action: EmailAction;
  outro: string;
}

export interface EmailContent {
  body: EmailBody;
}
