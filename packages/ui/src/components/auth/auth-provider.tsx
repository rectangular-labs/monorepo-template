"use client";

import type {
  BaseAuthClient,
  CompleteAuthClient,
} from "@rectangular-labs/auth/client";
import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

const AuthViewPaths = {
  SIGN_UP: "SIGN_UP",
  EMAIL_OTP: "EMAIL_OTP",
  MAGIC_LINK: "MAGIC_LINK",
  TWO_FACTOR: "TWO_FACTOR",
  RECOVER_ACCOUNT: "RECOVER_ACCOUNT",
  SIGN_IN: "SIGN_IN",
  FORGOT_PASSWORD: "FORGOT_PASSWORD",
  RESET_PASSWORD: "RESET_PASSWORD",
} as const;
export type AuthViewPath = (typeof AuthViewPaths)[keyof typeof AuthViewPaths];

export interface OnAuthComplete {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  successRedirect?: string;
  errorRedirect?: string;
  newUserRedirect?: string;
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
   * @default false
   */
  enableRememberMe?: boolean;
  /**
   * whether to use username instead of email for sign in
   * @default false
   */
  useUsername?: boolean;
};

type AuthContextValue = {
  view: AuthViewPath;
  setView: (view: AuthViewPath) => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  viewPaths: typeof AuthViewPaths;
  authClient: CompleteAuthClient;
  hasMagicLink: boolean;
  hasEmailOTP: boolean;
  hasPasskey: boolean;
  hasOneTap: boolean;
  hasUsername: boolean;
  credentials?: CredentialsOptions;
} & OnAuthComplete;
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  initialView = "SIGN_IN",
  authClient,
  onAuthComplete,
  children,
  credentials,
}: PropsWithChildren<{
  initialView?: AuthViewPath;
  authClient: BaseAuthClient;
  onAuthComplete?: OnAuthComplete;
  credentials?: CredentialsOptions;
}>) {
  const [view, setView] = useState<AuthViewPath>(initialView);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const successRef = useRef(onAuthComplete?.onSuccess);
  const errorRef = useRef(onAuthComplete?.onError);

  const handleSuccess = useCallback(() => {
    successRef.current?.();
  }, []);

  const handleError = useCallback((error: unknown) => {
    errorRef.current?.(error);
  }, []);

  const hasUsername = "username" in authClient.signIn;
  const defaultCredentials = {
    enableConfirmPassword: false,
    enableForgotPassword: true,
    enableRememberMe: true,
    useUsername: hasUsername,
  };

  return (
    <AuthContext.Provider
      value={{
        authClient: authClient as unknown as CompleteAuthClient,
        isSubmitting,
        setIsSubmitting,
        view,
        setView,
        viewPaths: AuthViewPaths,
        onError: handleError,
        onSuccess: handleSuccess,
        successRedirect: onAuthComplete?.successRedirect ?? "",
        errorRedirect: onAuthComplete?.errorRedirect ?? "",
        newUserRedirect: onAuthComplete?.newUserRedirect ?? "",
        hasMagicLink: "magicLink" in authClient.signIn,
        hasEmailOTP: "emailOTP" in authClient.signIn,
        hasPasskey: "passkey" in authClient.signIn,
        hasOneTap: "oneTap" in authClient,
        hasUsername,
        credentials: credentials ?? defaultCredentials,
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
