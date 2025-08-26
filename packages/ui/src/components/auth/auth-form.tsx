"use client";

import { type AuthViewPath, useAuth } from "./auth-provider";
import { ChangePasswordForm } from "./forms/change-password";
import { IdentifierCaptureForm } from "./forms/identifier-capture";
import { RecoverAccountForm } from "./forms/recover-account";
import { SignInForm } from "./forms/sign-in";
import { SignUpForm } from "./forms/sign-up";
import { TwoFactorForm } from "./forms/two-factor";
import {
  VerificationForm,
  type VerificationInfo,
} from "./forms/verification-form";

export function AuthForm({
  view,
  setView,
  shouldDisable,
  setShouldDisable,
  verificationInfo,
  setVerificationInfo,
  resetToken,
}: {
  view: AuthViewPath;
  setView: (view: AuthViewPath) => void;
  shouldDisable: boolean;
  setShouldDisable: (disabled: boolean) => void;
  verificationInfo: VerificationInfo | null;
  setVerificationInfo: (info: VerificationInfo | null) => void;
  resetToken?: string | undefined;
}) {
  const { viewPaths } = useAuth();

  switch (view) {
    case viewPaths.SIGN_UP_PASSWORD:
      return (
        <SignUpForm
          setShouldDisable={setShouldDisable}
          setVerificationInfo={setVerificationInfo}
          setView={setView}
          shouldDisable={shouldDisable}
        />
      );
    case viewPaths.SIGN_IN_PASSWORD:
      return (
        <SignInForm
          setShouldDisable={setShouldDisable}
          setVerificationInfo={setVerificationInfo}
          setView={setView}
          shouldDisable={shouldDisable}
        />
      );
    case viewPaths.MAGIC_LINK:
      return (
        <IdentifierCaptureForm
          mode="magic-link"
          setShouldDisable={setShouldDisable}
          setVerificationInfo={setVerificationInfo}
          setView={setView}
          shouldDisable={shouldDisable}
          submitText="Send magic link"
        />
      );
    case viewPaths.EMAIL_OTP:
      return (
        <IdentifierCaptureForm
          mode="email-code"
          setShouldDisable={setShouldDisable}
          setVerificationInfo={setVerificationInfo}
          setView={setView}
          shouldDisable={shouldDisable}
          submitText="Send code"
        />
      );
    case viewPaths.PHONE_OTP:
      return (
        <IdentifierCaptureForm
          mode="phone-code"
          setShouldDisable={setShouldDisable}
          setVerificationInfo={setVerificationInfo}
          setView={setView}
          shouldDisable={shouldDisable}
          submitText="Send code"
        />
      );
    case viewPaths.FORGOT_PASSWORD:
      return (
        <IdentifierCaptureForm
          mode="forget-password-email"
          setShouldDisable={setShouldDisable}
          setVerificationInfo={(info) => setVerificationInfo(info)}
          setView={setView}
          shouldDisable={shouldDisable}
          submitText="Send reset link"
        />
      );
    case viewPaths.IDENTITY_VERIFICATION:
      return verificationInfo ? (
        <VerificationForm
          identifier={verificationInfo.identifier}
          mode={verificationInfo.mode}
          setVerificationInfo={setVerificationInfo}
          setView={setView}
        />
      ) : null;
    case viewPaths.RESET_PASSWORD:
      return (verificationInfo?.mode === "password-reset-email-code" ||
        verificationInfo?.mode === "password-reset-phone-code") &&
        verificationInfo?.code ? (
        <ChangePasswordForm
          code={verificationInfo.code}
          email={verificationInfo.identifier}
          mode={"reset-code"}
        />
      ) : (
        <ChangePasswordForm mode={"reset-token"} token={resetToken ?? ""} />
      );
    case viewPaths.TWO_FACTOR:
      return <TwoFactorForm setView={setView} />;
    case viewPaths.RECOVER_ACCOUNT:
      return <RecoverAccountForm />;

    default:
      return null;
  }
}
