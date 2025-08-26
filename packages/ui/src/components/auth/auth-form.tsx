"use client";

import { useState } from "react";
import { type AuthViewPath, useAuth } from "./auth-provider";
import { ForgotPasswordForm } from "./forms/forget-password";
import { IdentifierCaptureForm } from "./forms/identifier-capture";
import { RecoverAccountForm } from "./forms/recover-account";
import { SignInForm } from "./forms/sign-in";
import { SignUpForm } from "./forms/sign-up";
import { TwoFactorForm } from "./forms/two-factor";
import {
  VerificationForm,
  type VerificationInfo,
} from "./forms/verification-form";
import { ChangePasswordForm } from "./new-forms/change-password";

export function AuthForm({
  view,
  setView,
  isSomethingSubmitting,
  setIsSomethingSubmitting,
}: {
  view: AuthViewPath;
  setView: (view: AuthViewPath) => void;
  isSomethingSubmitting: boolean;
  setIsSomethingSubmitting: (isSomethingSubmitting: boolean) => void;
}) {
  const {
    authClient,
    viewPaths,
    successHandler,
    successCallbackURL,
    errorCallbackURL,
    newUserCallbackURL,
  } = useAuth();

  const [verificationInfo, setVerificationInfo] = useState<
    (VerificationInfo & { code?: string | undefined }) | null
  >(null);

  async function sendMagicLink({ identifier }: { identifier: string }) {
    setIsSomethingSubmitting(true);
    const response = await authClient.signIn.magicLink({
      email: identifier,
      callbackURL: successCallbackURL,
      newUserCallbackURL,
      errorCallbackURL,
    });
    setIsSomethingSubmitting(false);
    if (!response.error) {
      setView(viewPaths.VERIFICATION_TOKEN);
      setVerificationInfo({
        mode: "magic-link-token",
        medium: "email",
        identifier,
      });
    }
    if (response.error?.status === 404) {
      return {
        error: {
          message: "Route not found. Did you enable the `magicLink` plugin?",
        },
      };
    }
    return response;
  }

  async function sendEmailOTP({ identifier }: { identifier: string }) {
    setIsSomethingSubmitting(true);
    const response = await authClient.emailOtp.sendVerificationOtp({
      email: identifier,
      type: "sign-in",
    });
    setIsSomethingSubmitting(false);
    if (!response.error) {
      setView(viewPaths.VERIFICATION_CODE);
      setVerificationInfo({
        medium: "email",
        mode: "code",
        identifier,
      });
    }
    if (response.error?.status === 404) {
      return {
        error: {
          message: "Route not found. Did you enable the `emailOtp` plugin?",
        },
      };
    }
    return response;
  }
  async function handleVerificationComplete({
    mode,
    code,
    medium,
    identifier,
  }: VerificationInfo & {
    code: string | undefined;
  }) {
    if (!mode.endsWith("code")) {
      // This is the token based verification.
      // Pending user to click link in their email/phone.
      return;
    }
    if (mode === "code" || mode === "verification-email-code") {
      // done with login, do success flow
      await successHandler();
    }
    if (mode === "password-reset-code") {
      // Password code valid, proceed to reset password
      setView(viewPaths.RESET_PASSWORD);
      setVerificationInfo({
        mode: "password-reset-code",
        medium,
        identifier,
        code,
      });
    }
  }

  console.log("view", view);
  console.log("verificationInfo", verificationInfo);
  switch (view) {
    case viewPaths.SIGN_UP_PASSWORD:
      return (
        <SignUpForm
          isSomethingSubmitting={isSomethingSubmitting}
          setIsSomethingSubmitting={setIsSomethingSubmitting}
          setVerificationInfo={setVerificationInfo}
          setView={setView}
        />
      );
    case viewPaths.SIGN_IN_PASSWORD:
      return (
        <SignInForm
          isSomethingSubmitting={isSomethingSubmitting}
          setIsSomethingSubmitting={setIsSomethingSubmitting}
          setVerificationInfo={setVerificationInfo}
          setView={setView}
        />
      );
    case viewPaths.MAGIC_LINK:
      return (
        <IdentifierCaptureForm
          isDisabled={isSomethingSubmitting}
          medium="email"
          onSubmit={sendMagicLink}
          submitText="Send magic link"
        />
      );
    case viewPaths.EMAIL_OTP:
      return (
        <IdentifierCaptureForm
          isDisabled={isSomethingSubmitting}
          medium="email"
          onSubmit={sendEmailOTP}
          submitText="Send code"
        />
      );
    case viewPaths.VERIFICATION_CODE:
      return verificationInfo ? (
        <VerificationForm
          identifier={verificationInfo.identifier}
          medium={verificationInfo.medium}
          mode={verificationInfo.mode}
          onComplete={handleVerificationComplete}
        />
      ) : null;
    case viewPaths.VERIFICATION_TOKEN:
      return verificationInfo ? (
        <VerificationForm
          identifier={verificationInfo.identifier}
          medium={verificationInfo.medium}
          mode={verificationInfo.mode}
          onComplete={handleVerificationComplete}
        />
      ) : null;
    case viewPaths.TWO_FACTOR:
      return <TwoFactorForm />;
    case viewPaths.RECOVER_ACCOUNT:
      return <RecoverAccountForm />;
    case viewPaths.FORGOT_PASSWORD:
      return <ForgotPasswordForm />;
    case viewPaths.RESET_PASSWORD:
      return <ChangePasswordForm mode={"reset-token"} reset={{ token: "" }} />;
    default:
      return null;
  }
}
