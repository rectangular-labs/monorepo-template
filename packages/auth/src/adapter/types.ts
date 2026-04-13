/**
 * The various ways to verify a user.
 */
export type VerificationMode =
  | "login-email-code"
  | "login-email-token"
  | "login-phone-code"
  | "2fa-totp"
  | "2fa-otp"
  | "2fa-backup-code"
  | "password-reset-email-code"
  | "password-reset-email-token"
  | "password-reset-phone-code"
  | "verification-email-code"
  | "verification-email-token";

export type VerificationInfo = {
  /** Often this is the email or phone number depending on the {@param mode}. */
  identifier: string;
  mode: VerificationMode;
  /** Whether the user trusts the device. Only relevant for {@link VerificationMode.login-email-token} and {@link VerificationMode.login-phone-code}. */
  trustDevice?: boolean | undefined;
  /** Populated after code-based verification succeeds */
  code?: string | undefined;
};

export type AuthResult =
  | { type: "success"; data?: unknown }
  | { type: "error"; message: string; code?: string | undefined; field?: string | undefined }
  | { type: "pending-redirect"; url: string }
  | { type: "needs-verification"; mode: VerificationMode; identifier: string }
  | { type: "needs-2fa"; method?: "totp" | "otp" | undefined };

export type AuthFlowState =
  | { step: "sign-in" }
  | { step: "sign-up" }
  | { step: "verification"; info: VerificationInfo }
  | { step: "forgot-password" }
  | { step: "change-password" }
  | {
      step: "reset-password";
      token?: string | undefined;
      code?: string | undefined;
      identifier?: string | undefined;
    }
  | { step: "2fa"; method?: "totp" | "otp" | undefined }
  | { step: "recover-account" };

export interface CallbackURLs {
  success?: string | undefined;
  error?: string | undefined;
  newUser?: string | undefined;
  resetPassword?: string | undefined;
}

export interface SocialSignInOptions {
  method?: "social" | "generic" | undefined;
  callbackUrls?: CallbackURLs | undefined;
  requestSignUp?: boolean | undefined;
  scopes?: string[] | undefined;
  additionalData?: Record<string, unknown> | undefined;
}

export interface AuthAdapter {
  signInWithPassword: (
    values: (
      | { type: "email"; email: string }
      | {
          type: "username";
          username: string;
        }
    ) & { password: string; rememberMe?: boolean | undefined },
  ) => Promise<AuthResult>;
  signUpWithPassword: (values: {
    email: string;
    password: string;
    name?: string | undefined;
    username?: string | undefined;
    [key: string]: unknown;
  }) => Promise<AuthResult>;
  resetPassword: (
    values:
      | { type: "email-token"; token: string; newPassword: string }
      | { type: "email-code"; code: string; email: string; newPassword: string }
      | { type: "phone-code"; code: string; phoneNumber: string; newPassword: string },
  ) => Promise<AuthResult>;
  changePassword: (values: { oldPassword: string; newPassword: string }) => Promise<AuthResult>;

  sendCode: (
    info: Omit<VerificationInfo, "code">,
    callbackURLs?: CallbackURLs,
  ) => Promise<AuthResult>;
  verifyCode: (values: Omit<VerificationInfo, "code"> & { code: string }) => Promise<AuthResult>;
  signInWithSocial: (provider: string, options?: SocialSignInOptions) => Promise<AuthResult>;
  signInWithPasskey: () => Promise<AuthResult>;
  generate2FACredential: (
    values: { type: "totp"; password: string } | { type: "backup-codes"; password: string },
  ) => Promise<AuthResult>;
}

export type AdditionalField = {
  /** @default "string" */
  type: "string" | "number" | "boolean";
  required?: boolean;
  /** Should match the type of the field. */
  default?: string | number | boolean;
  /** @default false */
  multiline?: boolean;
  label?: string;
  placeholder?: string;
  validate?: (value: string) => Promise<boolean> | boolean;
};
