"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useMemo } from "react";
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
import { EmailOTPButton } from "./email-otp-button";
import { MagicLinkButton } from "./magic-link-button";
import { OneTap } from "./one-tap";
import { PasskeyButton } from "./passkey-button";

const TITLES = {
  SIGN_IN: "Sign in",
  SIGN_UP: "Sign up",
  MAGIC_LINK: "Magic link",
  EMAIL_OTP: "Email OTP",
  FORGOT_PASSWORD: "Forgot password",
  RESET_PASSWORD: "Reset password",
  RECOVER_ACCOUNT: "Recover account",
};

const DESCRIPTIONS = {
  DISABLED_CREDENTIALS_DESCRIPTION:
    "Choose a provider to login to your account",
  USERNAME_DESCRIPTION: "Enter your username",
  SIGN_UP_DESCRIPTION: "Create an account to get started",
  MAGIC_LINK_DESCRIPTION: "Enter your email to receive a magic link",
  EMAIL_OTP_DESCRIPTION: "Enter your email to receive an OTP",
  FORGOT_PASSWORD_DESCRIPTION:
    "Enter your email to receive a password reset link",
  RESET_PASSWORD_DESCRIPTION: "Enter your new password",
};

export interface AuthViewProps {
  socialLayout?: "auto" | "horizontal" | "grid" | "vertical";
}
export function AuthCard({ socialLayout: socialLayoutProp }: AuthViewProps) {
  const {
    view,
    setView,
    viewPaths,
    hasMagicLink,
    hasEmailOTP,
    hasPasskey,
    hasOneTap,
    credentials,
  } = useAuth();
  let socialLayout = socialLayoutProp;
  if (socialLayout === "auto") {
    socialLayout = !credentials ? "vertical" : "horizontal";
    // : social?.providers && social.providers.length > 2
    //   ? "horizontal"
    //   : "vertical";
  }

  const credentialViews: AuthViewPath[] = [
    viewPaths.SIGN_IN,
    viewPaths.SIGN_UP,
    viewPaths.FORGOT_PASSWORD,
    viewPaths.MAGIC_LINK,
    viewPaths.EMAIL_OTP,
  ];
  const showPasskeyViews: AuthViewPath[] = [
    viewPaths.SIGN_IN,
    viewPaths.MAGIC_LINK,
    viewPaths.EMAIL_OTP,
    viewPaths.RECOVER_ACCOUNT,
    viewPaths.TWO_FACTOR,
    viewPaths.FORGOT_PASSWORD,
  ];
  const showSignUpFooter: AuthViewPath[] = [
    viewPaths.SIGN_IN,
    viewPaths.MAGIC_LINK,
    viewPaths.EMAIL_OTP,
  ];
  const showSignInFooter: AuthViewPath[] = [viewPaths.SIGN_UP];

  const { title, description } = useMemo(
    () => ({
      title: TITLES[view as keyof typeof TITLES],
      description:
        DESCRIPTIONS[`${view}_DESCRIPTION` as keyof typeof DESCRIPTIONS],
    }),
    [view],
  );

  return (
    <Card className={"w-full max-w-sm"}>
      <CardHeader>
        <CardTitle className={"text-lg md:text-xl"}>{title}</CardTitle>
        {description && (
          <CardDescription className={"text-xs md:text-sm"}>
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className={"grid gap-6"}>
        {hasOneTap &&
          ["SIGN_IN", "SIGN_UP", "MAGIC_LINK", "EMAIL_OTP"].includes(
            view as string,
          ) && <OneTap />}

        <div className="grid gap-4">
          {credentials && <AuthForm />}

          {hasMagicLink &&
            ((credentials && credentialViews.includes(view)) ||
              (hasEmailOTP && view === viewPaths.EMAIL_OTP)) && (
              <MagicLinkButton />
            )}

          {hasEmailOTP &&
            ((credentials && credentialViews.includes(view)) ||
              (hasMagicLink &&
                (
                  [viewPaths.MAGIC_LINK, viewPaths.SIGN_IN] as AuthViewPath[]
                ).includes(view))) && <EmailOTPButton />}
        </div>

        {view !== "RESET_PASSWORD" && (
          <div className="grid gap-4">
            {hasPasskey && showPasskeyViews.includes(view) && <PasskeyButton />}
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-center gap-1.5 text-muted-foreground text-sm">
        {showSignUpFooter.includes(view) && (
          <>
            <span>Don't have an account?</span>
            <Button
              onClick={() => setView(viewPaths.SIGN_UP)}
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
              onClick={() => setView(viewPaths.SIGN_IN)}
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
              onClick={() => setView(viewPaths.SIGN_IN)}
              size="sm"
              variant="link"
            >
              <ArrowLeftIcon className="size-3" />
            </Button>
          )}
      </CardFooter>
    </Card>
  );
}
