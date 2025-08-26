"use client";

import type {
  BaseAuthClient,
  CompleteAuthClient,
} from "@rectangular-labs/auth/client";
import { LockIcon, MailIcon, PhoneIcon } from "lucide-react";
import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import type { SocialProvider } from "./social-providers";

const AuthViewPaths = {
  // identity capture. These all ask for either a phone number or email address.
  SIGN_UP_PASSWORD: "SIGN_UP_PASSWORD",
  SIGN_IN_PASSWORD: "SIGN_IN_PASSWORD",
  EMAIL_OTP: "EMAIL_OTP",
  MAGIC_LINK: "MAGIC_LINK",
  PHONE_OTP: "PHONE_OTP",
  FORGOT_PASSWORD: "FORGOT_PASSWORD",
  // verification types. These all ask for a code or require you to check your identifier for some link.
  IDENTITY_VERIFICATION: "IDENTITY_VERIFICATION",
  // password reset
  RESET_PASSWORD: "RESET_PASSWORD",
  // two factor
  TWO_FACTOR: "TWO_FACTOR",
  RECOVER_ACCOUNT: "RECOVER_ACCOUNT",
} as const;
export type AuthViewPath = (typeof AuthViewPaths)[keyof typeof AuthViewPaths];

export interface Redirects {
  onSuccess?: (() => void | Promise<void>) | undefined;
  successCallbackURL?: string | undefined;
  errorCallbackURL?: string | undefined;
  newUserCallbackURL?: string | undefined;
  resetPasswordCallbackURL?: string | undefined;
}

export type AdditionalField = {
  /**
   * The type of the additional field
   * @default "string"
   */
  type: "string" | "number" | "boolean";
  required?: boolean;
  /**
   * The default value of the additional field. Should match the type of the field.
   * @default undefined
   */
  default?: string | number | boolean;
  /**
   * Whether the additional field is a multiline input
   * @default false
   */
  multiline?: boolean;
  /**
   * The label of the additional field
   * @default undefined
   */
  label?: string;
  /**
   * The placeholder of the additional field
   * @default undefined
   */
  placeholder?: string;
  /**
   * A function to validate the additional field
   * @default undefined
   */
  validate?: (value: string) => Promise<boolean> | boolean;
};

export type CredentialsOptions = {
  /**
   * Additional fields to be added to the sign up form
   * @default {}
   */
  additionalFields?: Record<string, AdditionalField>;
  /**
   * Enable or disable the Confirm Password input when signing up
   * @default false
   */
  enableConfirmPassword?: boolean;
  /**
   * Enable or disable Forgot Password flow
   * @default true
   */
  enableForgotPassword?: boolean;
  /**
   * Enable or disable Remember Me checkbox
   * @default true
   */
  enableRememberMe?: boolean;
  verificationMode?: "code" | "token";
  /**
   * whether to use username instead of email for sign in
   * @default false
   */
  useUsername?: boolean;
};

type AuthContextValue = {
  viewPaths: typeof AuthViewPaths;
  authClient: CompleteAuthClient;
  defaultFormView: {
    view: AuthViewPath;
    text: string;
    icon: React.ElementType;
  };
  credentials: CredentialsOptions | undefined;
  socialProviders: SocialProvider[];
  hasMagicLink: boolean;
  hasEmailOTP: boolean;
  hasPasskey: boolean;
  hasOneTap: boolean;
  hasUsername: boolean;
  hasPhoneOTP: boolean;
  successHandler: () => Promise<void>;
  successCallbackURL: string;
  errorCallbackURL: string;
  newUserCallbackURL: string;
  resetPasswordCallbackURL: string;
  onSuccess: Redirects["onSuccess"];
};
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  // initialView = "SIGN_IN",
  authClient,
  redirects,
  children,
  credentials,
  socialProviders,
  plugins = [],
}: PropsWithChildren<{
  redirects?: Redirects;
  authClient: BaseAuthClient;
  credentials?: CredentialsOptions | undefined;
  socialProviders?: SocialProvider[];
  plugins?: (
    | "magicLink"
    | "emailOTP"
    | "passkey"
    | "oneTap"
    | "username"
    | "phoneOTP"
  )[];
}>) {
  const hasUsername = plugins?.includes("username");
  const hasMagicLink = plugins?.includes("magicLink");
  const hasEmailOTP = plugins?.includes("emailOTP");
  const hasPhoneOTP = plugins?.includes("phoneOTP");
  const defaultCredentials = {
    enableConfirmPassword: false,
    enableForgotPassword: true,
    enableRememberMe: true,
    useUsername: hasUsername,
    verificationMode: "token" as const,
  };
  const defaultFormView = useMemo(() => {
    if (credentials) {
      return {
        view: AuthViewPaths.SIGN_IN_PASSWORD,
        text: "password",
        icon: LockIcon,
      };
    }
    if (hasMagicLink) {
      return {
        view: AuthViewPaths.MAGIC_LINK,
        text: "magic link",
        icon: MailIcon,
      };
    }
    if (hasEmailOTP) {
      return {
        view: AuthViewPaths.EMAIL_OTP,
        text: "email code",
        icon: MailIcon,
      };
    }
    if (hasPhoneOTP) {
      return {
        view: AuthViewPaths.PHONE_OTP,
        text: "phone code",
        icon: PhoneIcon,
      };
    }
    return {
      view: AuthViewPaths.SIGN_IN_PASSWORD,
      text: "password",
      icon: LockIcon,
    };
  }, [credentials, hasMagicLink, hasEmailOTP, hasPhoneOTP]);

  const onSuccessRef = useRef(redirects?.onSuccess);
  const successHandler = useCallback(async () => {
    if (onSuccessRef.current) {
      return await Promise.resolve(onSuccessRef.current());
    }
    window.location.href = redirects?.successCallbackURL ?? "/";
  }, [redirects?.successCallbackURL]);

  return (
    <AuthContext.Provider
      value={{
        authClient: authClient as unknown as CompleteAuthClient,
        viewPaths: AuthViewPaths,
        defaultFormView,
        credentials: credentials
          ? { ...defaultCredentials, ...(credentials ?? {}) }
          : undefined,
        socialProviders: socialProviders ?? [],
        successHandler,
        onSuccess: redirects?.onSuccess,
        successCallbackURL: redirects?.successCallbackURL ?? "/",
        errorCallbackURL: redirects?.errorCallbackURL ?? "/login?type=error",
        newUserCallbackURL: redirects?.newUserCallbackURL ?? "/",
        resetPasswordCallbackURL:
          redirects?.resetPasswordCallbackURL ?? "/login?type=reset-password",
        hasMagicLink,
        hasEmailOTP,
        hasPhoneOTP,
        hasUsername,
        hasPasskey: plugins?.includes("passkey"),
        hasOneTap: plugins?.includes("oneTap"),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
