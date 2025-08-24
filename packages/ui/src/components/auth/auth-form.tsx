"use client";

import { useAuth } from "./auth-provider";
import { EmailOTPForm } from "./forms/email-otp";
import { ForgotPasswordForm } from "./forms/forget-password";
import { MagicLinkForm } from "./forms/magic-link";
import { RecoverAccountForm } from "./forms/recover-account";
import { ResetPasswordForm } from "./forms/reset-password";
import { SignInForm } from "./forms/sign-in";
import { SignUpForm } from "./forms/sign-up";
import { TwoFactorForm } from "./forms/two-factor";

export function AuthForm() {
  const { view } = useAuth();

  switch (view) {
    case "SIGN_UP":
      return <SignUpForm />;
    case "SIGN_IN":
      return <SignInForm />;
    case "TWO_FACTOR":
      return <TwoFactorForm />;
    case "RECOVER_ACCOUNT":
      return <RecoverAccountForm />;
    case "MAGIC_LINK":
      return <MagicLinkForm />;
    case "EMAIL_OTP":
      return <EmailOTPForm />;
    case "FORGOT_PASSWORD":
      return <ForgotPasswordForm />;
    case "RESET_PASSWORD":
      return <ResetPasswordForm />;
    default:
      return null;
  }
}
