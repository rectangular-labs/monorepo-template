"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { AuthForm } from "./auth-form";
import { type AuthViewPath, useAuth } from "./auth-provider";
import type {
  VerificationInfo,
  VerificationMode,
} from "./forms/verification-form";
import { OneTap } from "./one-tap";
import { PasskeyButton } from "./passkey-button";
import { SignInEmailOTPButton } from "./sign-in-email-otp-button";
import { SignInMagicLinkButton } from "./sign-in-magic-link-button";
import { SignInPhoneOTPButton } from "./sign-in-phone-otp-button";

const TITLES: Record<AuthViewPath, string> = {
  SIGN_IN_PASSWORD: "Sign in",
  SIGN_UP_PASSWORD: "Sign up",
  TWO_FACTOR: "Two-factor authentication",
  IDENTITY_VERIFICATION: "",
  MAGIC_LINK: "Magic link",
  EMAIL_OTP: "Email Code",
  PHONE_OTP: "Phone Code",
  FORGOT_PASSWORD: "Forgot password",
  RESET_PASSWORD: "Reset password",
  RECOVER_ACCOUNT: "Recover account",
};

const DESCRIPTIONS: Record<`${AuthViewPath}_DESCRIPTION`, string> = {
  SIGN_IN_PASSWORD_DESCRIPTION: "Log back in to get started",
  SIGN_UP_PASSWORD_DESCRIPTION: "Create an account to get started",
  TWO_FACTOR_DESCRIPTION: "Enter the code sent to your phone",
  IDENTITY_VERIFICATION_DESCRIPTION: "",
  MAGIC_LINK_DESCRIPTION: "Enter your email to receive a magic link",
  EMAIL_OTP_DESCRIPTION: "Enter your email to receive an OTP",
  PHONE_OTP_DESCRIPTION: "Enter your phone number to receive a code",
  FORGOT_PASSWORD_DESCRIPTION:
    "Enter your email to receive a password reset link",
  RESET_PASSWORD_DESCRIPTION: "Enter your new password",
  RECOVER_ACCOUNT_DESCRIPTION: "Use your backup code to recover your account",
};

const VERIFICATION_TEXT: Record<VerificationMode, string> = {
  "verification-email-token": "verification link",
  "verification-email-code": "verification code",
  "password-reset-token": "password reset link",
  "password-reset-email-code": "password reset code",
  "password-reset-phone-code": "password reset code",
  "magic-link-token": "sign-in link",
  "email-code": "verification code",
  "phone-code": "verification code",
};

export interface AuthViewProps {
  initialView?: AuthViewPath;
  socialLayout?: "auto" | "horizontal" | "grid" | "vertical";
}
export function AuthCard({
  initialView,
  socialLayout: socialLayoutProp,
}: AuthViewProps) {
  const {
    viewPaths,
    hasMagicLink,
    hasEmailOTP,
    hasPasskey,
    hasOneTap,
    hasPhoneOTP,
    credentials,
  } = useAuth();
  const [view, setView] = useState<AuthViewPath>(() => {
    if (initialView) {
      return initialView;
    }
    if (credentials) {
      return viewPaths.SIGN_IN_PASSWORD;
    }
    if (hasMagicLink) {
      return viewPaths.MAGIC_LINK;
    }
    if (hasEmailOTP) {
      return viewPaths.EMAIL_OTP;
    }
    if (hasPhoneOTP) {
      return viewPaths.PHONE_OTP;
    }
    return viewPaths.SIGN_IN_PASSWORD;
  });
  const [shouldDisable, setShouldDisable] = useState(false);
  const [verificationInfo, setVerificationInfo] =
    useState<VerificationInfo | null>(null);

  let socialLayout = socialLayoutProp;
  if (socialLayout === "auto") {
    socialLayout = !credentials ? "vertical" : "horizontal";
    // : social?.providers && social.providers.length > 2
    //   ? "horizontal"
    //   : "vertical";
  }

  const loginViews: AuthViewPath[] = [
    viewPaths.SIGN_IN_PASSWORD,
    viewPaths.SIGN_UP_PASSWORD,
    viewPaths.MAGIC_LINK,
    viewPaths.EMAIL_OTP,
    viewPaths.PHONE_OTP,
  ];
  const showSignUpFooter: AuthViewPath[] = [
    viewPaths.SIGN_IN_PASSWORD,
    viewPaths.MAGIC_LINK,
    viewPaths.EMAIL_OTP,
    viewPaths.PHONE_OTP,
  ];
  const showSignInFooter: AuthViewPath[] = [viewPaths.SIGN_UP_PASSWORD];

  const { title, description } = useMemo(() => {
    if (view === viewPaths.IDENTITY_VERIFICATION) {
      return {
        title: `Check you ${verificationInfo?.mode.includes("phone") ? "phone" : "email"}`,
        description: `We sent a ${VERIFICATION_TEXT[verificationInfo?.mode as VerificationMode]} to ${verificationInfo?.identifier}`,
      };
    }

    return {
      title: TITLES[view as keyof typeof TITLES],
      description:
        DESCRIPTIONS[`${view}_DESCRIPTION` as keyof typeof DESCRIPTIONS],
    };
  }, [view, verificationInfo, viewPaths.IDENTITY_VERIFICATION]);

  return (
    <Card className={"w-full max-w-sm"}>
      {(title || description) && (
        <CardHeader>
          {title && (
            <CardTitle className={"text-lg md:text-xl"}>{title}</CardTitle>
          )}
          {description && (
            <CardDescription className={"text-xs md:text-sm"}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}

      <CardContent className={"grid gap-6"}>
        {hasOneTap && loginViews.includes(view) && <OneTap />}
        <div className="grid gap-4">
          <AuthForm
            setShouldDisable={setShouldDisable}
            setVerificationInfo={setVerificationInfo}
            setView={setView}
            shouldDisable={shouldDisable}
            verificationInfo={verificationInfo}
            view={view}
          />
          {hasMagicLink && credentials && loginViews.includes(view) && (
            <SignInMagicLinkButton
              isSubmitting={shouldDisable}
              setView={setView}
              view={view}
            />
          )}
          {hasEmailOTP && credentials && loginViews.includes(view) && (
            <SignInEmailOTPButton
              isSubmitting={shouldDisable}
              setView={setView}
              view={view}
            />
          )}
          {hasPhoneOTP && credentials && loginViews.includes(view) && (
            <SignInPhoneOTPButton
              isSubmitting={shouldDisable}
              setView={setView}
              view={view}
            />
          )}
        </div>

        {loginViews.includes(view) && (
          <div className="grid gap-4">{hasPasskey && <PasskeyButton />}</div>
        )}
      </CardContent>

      <CardFooter className="justify-center gap-1.5 text-muted-foreground text-sm">
        {showSignUpFooter.includes(view) && (
          <>
            <span>Don't have an account?</span>
            <Button
              className="px-0"
              onClick={() => setView(viewPaths.SIGN_UP_PASSWORD)}
              size="sm"
              variant="link"
            >
              Sign up
            </Button>
          </>
        )}
        {showSignInFooter.includes(view) && (
          <>
            <span>Already have an account?</span>
            <Button
              className="px-0"
              onClick={() => setView(viewPaths.SIGN_IN_PASSWORD)}
              size="sm"
              variant="link"
            >
              Sign in
            </Button>
          </>
        )}
        {!showSignUpFooter.includes(view) &&
          !showSignInFooter.includes(view) && (
            <Button
              className="px-0"
              onClick={() => setView(viewPaths.SIGN_IN_PASSWORD)}
              size="sm"
              variant="link"
            >
              <ArrowLeftIcon className="size-3" /> Go Back
            </Button>
          )}
      </CardFooter>
    </Card>
  );
}
