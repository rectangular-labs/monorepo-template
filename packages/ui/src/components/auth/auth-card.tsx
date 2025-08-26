"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "../../utils/cn";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { AuthForm } from "./auth-form";
import { type AuthViewPath, useAuth } from "./auth-provider";
import type {
  VerificationInfo,
  VerificationMode,
} from "./forms/verification-form";
import { OneTap } from "./one-tap";
import { PasskeyButton } from "./passkey-button";
import { ProviderButton } from "./provider-button";
import { SignInEmailCodeButton } from "./sign-in-email-code-button";
import { SignInMagicLinkButton } from "./sign-in-magic-link-button";
import { SignInPhoneCodeButton } from "./sign-in-phone-code-button";

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
  socialLayout: socialLayoutProp = "auto",
}: AuthViewProps) {
  const {
    viewPaths,
    defaultFormView,
    hasMagicLink,
    hasEmailOTP,
    hasPasskey,
    hasOneTap,
    hasPhoneOTP,
    credentials,
    socialProviders,
  } = useAuth();
  const hasForm = hasMagicLink || hasEmailOTP || hasPhoneOTP || !!credentials;
  const [view, setView] = useState<AuthViewPath>(() => {
    if (initialView) {
      return initialView;
    }
    return defaultFormView.view;
  });
  const [shouldDisable, setShouldDisable] = useState(false);
  const [verificationInfo, setVerificationInfo] =
    useState<VerificationInfo | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("type") === "reset-password") {
      setView(viewPaths.RESET_PASSWORD);
    }
    const err = sp.get("error");
    if (err) {
      setQueryError(err);
    }
    const token = sp.get("token");
    if (token) setResetToken(token);
  }, [viewPaths.RESET_PASSWORD]);

  const socialLayout = (() => {
    if (socialLayoutProp === "auto") {
      if (!credentials) {
        return "vertical";
      }
      if (socialProviders.length > 2) {
        return "horizontal";
      }
      return "vertical";
    }
    return socialLayoutProp;
  })();

  const loginViews: AuthViewPath[] = [
    viewPaths.SIGN_IN_PASSWORD,
    viewPaths.SIGN_UP_PASSWORD,
    viewPaths.MAGIC_LINK,
    viewPaths.EMAIL_OTP,
    viewPaths.PHONE_OTP,
  ];
  const signInViews: AuthViewPath[] = [
    viewPaths.SIGN_IN_PASSWORD,
    viewPaths.MAGIC_LINK,
    viewPaths.EMAIL_OTP,
    viewPaths.PHONE_OTP,
  ];
  const signUpViews: AuthViewPath[] = [viewPaths.SIGN_UP_PASSWORD];
  const showPasskey = hasPasskey && signInViews.includes(view);

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
        {hasForm && (
          <div className="grid gap-4">
            <AuthForm
              resetToken={resetToken ?? undefined}
              setShouldDisable={setShouldDisable}
              setVerificationInfo={setVerificationInfo}
              setView={setView}
              shouldDisable={shouldDisable}
              verificationInfo={verificationInfo}
              view={view}
            />
            {hasMagicLink &&
              defaultFormView.view !== viewPaths.MAGIC_LINK &&
              loginViews.includes(view) && (
                <SignInMagicLinkButton
                  isSubmitting={shouldDisable}
                  setView={setView}
                  view={view}
                />
              )}
            {hasEmailOTP &&
              defaultFormView.view !== viewPaths.EMAIL_OTP &&
              loginViews.includes(view) && (
                <SignInEmailCodeButton
                  isSubmitting={shouldDisable}
                  setView={setView}
                  view={view}
                />
              )}
            {hasPhoneOTP &&
              defaultFormView.view !== viewPaths.PHONE_OTP &&
              loginViews.includes(view) && (
                <SignInPhoneCodeButton
                  isSubmitting={shouldDisable}
                  setView={setView}
                  view={view}
                />
              )}
          </div>
        )}

        {loginViews.includes(view) &&
          (showPasskey || socialProviders.length > 0) && (
            <>
              {hasForm && (
                <div className={"flex items-center gap-2"}>
                  <Separator className={"!w-auto grow"} />
                  <span className="flex-shrink-0 text-muted-foreground text-sm">
                    Or continue with
                  </span>
                  <Separator className={"!w-auto grow"} />
                </div>
              )}
              <div className="grid gap-4">
                {socialProviders.length > 0 && (
                  <div
                    className={cn(
                      "flex w-full items-center justify-between gap-4",
                      socialLayout === "horizontal" && "flex-wrap",
                      socialLayout === "vertical" && "flex-col",
                      socialLayout === "grid" && "grid grid-cols-2",
                    )}
                  >
                    {socialProviders.map((socialProvider) => (
                      <ProviderButton
                        key={socialProvider.name}
                        provider={socialProvider}
                        setShouldDisable={setShouldDisable}
                        shouldDisable={shouldDisable}
                        socialLayout={socialLayout || "vertical"}
                      />
                    ))}
                  </div>
                )}
                {showPasskey && (
                  <PasskeyButton
                    setShouldDisable={setShouldDisable}
                    shouldDisable={shouldDisable}
                  />
                )}
              </div>
            </>
          )}
        {queryError && loginViews.includes(view) && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{queryError}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="justify-center gap-1.5 text-muted-foreground text-sm">
        {signInViews.includes(view) && (
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
        {signUpViews.includes(view) && (
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
        {!signInViews.includes(view) && !signUpViews.includes(view) && (
          <Button
            className="px-0"
            onClick={() => setView(defaultFormView.view)}
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
