import type { createAuthClient, CredentialVerificationType } from "../client";
import type { AuthAdapter, AuthResult } from "./types";

type BetterAuthResponse<T = Record<string, unknown>> = {
  data?: T | null;
  error?: {
    message?: unknown;
    status?: number;
    statusText?: string;
    code?: string | undefined;
  } | null;
};

function getErrorMessage(error: BetterAuthResponse["error"]): string {
  if (typeof error?.message === "string") {
    return error.message;
  }

  return "An unknown error occurred";
}

function notFoundError(pluginName?: string): AuthResult {
  return {
    type: "error",
    message: `Route not found. Have you enabled the ${pluginName ? `${pluginName} plugin` : "relevant plugin"} on the server?`,
    code: "NOT_FOUND",
  };
}

function toResult<T>(response: BetterAuthResponse<T>, pluginName?: string): AuthResult {
  if (response.error) {
    if (response.error?.status === 404) {
      return notFoundError(pluginName);
    }

    return {
      type: "error",
      message: getErrorMessage(response.error),
      code: response.error.code,
    };
  }

  return { type: "success", data: response.data };
}

function toResultWithField<T>(
  response: BetterAuthResponse<T>,
  field: string,
  code: string,
): AuthResult {
  if (response.error?.code === code) {
    return {
      type: "error",
      message: getErrorMessage(response.error),
      code: response.error.code,
      field,
    };
  }

  return toResult(response);
}

/**
 * Creates an `AuthAdapter` that wraps a Better Auth client.
 * All response normalization stays here so the UI layer only sees the
 * generic auth interface.
 */
export function createBetterAuthActions(
  client: ReturnType<typeof createAuthClient>,
  verificationType: CredentialVerificationType = "token",
): AuthAdapter {
  const auth = client;

  const signInWithPassword: AuthAdapter["signInWithPassword"] = async (values) => {
    const response = await (() => {
      if (values.type === "username") {
        return auth.signIn.username({
          username: values.username,
          password: values.password,
          rememberMe: values.rememberMe,
          callbackURL: values.successCallbackUrl,
        });
      }
      return client.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
        callbackURL: values.successCallbackUrl,
      });
    })();

    if (response.error?.status === 403) {
      const identifier = values.type === "email" ? values.email : values.username;
      return {
        type: "needs-verification",
        mode: verificationType === "token" ? "verification-email-token" : "verification-email-code",
        identifier,
      };
    }

    if (response.data && "twoFactorRedirect" in response.data && response.data.twoFactorRedirect) {
      return { type: "needs-2fa" };
    }

    return toResult(response);
  };

  const signUpWithPassword: AuthAdapter["signUpWithPassword"] = async (values) => {
    const { email, password, name, ...rest } = values;
    const response = await client.signUp.email({
      email,
      password,
      name: name ?? "",
      callbackURL: values.newUserCallbackURL,
      ...rest,
    });

    if (response.data && !response.data.token) {
      return {
        type: "needs-verification",
        mode: verificationType === "token" ? "verification-email-token" : "verification-email-code",
        identifier: email,
      };
    }
    return toResultWithField(response, "password", "PASSWORD_COMPROMISED");
  };

  const resetPassword: AuthAdapter["resetPassword"] = async (values) => {
    switch (values.type) {
      case "email-code":
        return toResultWithField(
          await auth.emailOtp.resetPassword({
            email: values.email,
            otp: values.code,
            password: values.newPassword,
          }),
          "password",
          "PASSWORD_COMPROMISED",
        );

      case "phone-code":
        return toResultWithField(
          await auth.phoneNumber.resetPassword({
            otp: values.code,
            phoneNumber: values.phoneNumber,
            newPassword: values.newPassword,
          }),
          "password",
          "PASSWORD_COMPROMISED",
        );

      case "email-token":
        return toResultWithField(
          await client.resetPassword({
            newPassword: values.newPassword,
            token: values.token,
          }),
          "password",
          "PASSWORD_COMPROMISED",
        );

      default: {
        const _never: never = values;
        return {
          type: "error",
          message: `Unsupported reset password mode: ${String(_never)}`,
        };
      }
    }
  };

  const changePassword: AuthAdapter["changePassword"] = async (values) => {
    const response = await client.changePassword({
      currentPassword: values.oldPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: true,
    });

    return toResultWithField(response, "password", "PASSWORD_COMPROMISED");
  };

  const signInWithSocial: AuthAdapter["signInWithSocial"] = async (provider, options) => {
    const sharedParams = {
      callbackURL: options?.callbackUrls?.success,
      errorCallbackURL: options?.callbackUrls?.error,
      newUserCallbackURL: options?.callbackUrls?.newUser,
      ...options,
    };
    const successResponse = (url: string): AuthResult => ({
      type: "pending-redirect",
      url,
    });
    if (options?.method === "generic") {
      const response = await auth.signIn.oauth2({
        providerId: provider,
        ...sharedParams,
      });
      return response.error
        ? toResult(response, "Generic OAuth")
        : successResponse(response.data.url);
    }

    const response = await auth.signIn.social({
      provider,
      ...sharedParams,
    });
    if (response.data?.url) {
      return successResponse(response.data.url);
    }
    return toResult(response);
  };

  const signInWithPasskey: AuthAdapter["signInWithPasskey"] = async () => {
    const response = await auth.signIn.passkey({ autoFill: true });
    return toResult(response);
  };

  const sendCode: AuthAdapter["sendCode"] = async (info, callbackURLs) => {
    const successResult = {
      type: "needs-verification" as const,
      mode: info.mode,
      identifier: info.identifier,
    };

    switch (info.mode) {
      case "login-email-code": {
        const response = await auth.emailOtp.sendVerificationOtp({
          email: info.identifier,
          type: "sign-in",
        });

        return response.error ? toResult(response, "emailOTP") : successResult;
      }
      case "login-email-token": {
        const response = await auth.signIn.magicLink({
          email: info.identifier,
          callbackURL: callbackURLs?.success,
          errorCallbackURL: callbackURLs?.error,
          newUserCallbackURL: callbackURLs?.newUser,
        });

        return response.error ? toResult(response, "magicLink") : successResult;
      }

      case "login-phone-code": {
        const response = await auth.phoneNumber.sendOtp({
          phoneNumber: info.identifier,
        });

        return response.error ? toResult(response, "phoneNumber") : successResult;
      }

      case "2fa-otp": {
        const response = await auth.twoFactor.sendOtp();

        return response.error ? toResult(response, "twoFactor") : successResult;
      }

      case "2fa-totp":
      case "2fa-backup-code":
        return {
          type: "error",
          message: `Unsupported verification mode: ${info.mode}`,
        };

      case "password-reset-email-code": {
        const response = await auth.emailOtp.sendVerificationOtp({
          email: info.identifier,
          type: "forget-password",
        });

        return response.error ? toResult(response, "emailOTP") : successResult;
      }

      case "password-reset-email-token": {
        const response = await client.requestPasswordReset({
          email: info.identifier,
          redirectTo: callbackURLs?.resetPassword,
        });

        return response.error ? toResult(response) : successResult;
      }

      case "password-reset-phone-code": {
        const response = await auth.phoneNumber.requestPasswordReset({
          phoneNumber: info.identifier,
        });

        return response.error ? toResult(response, "phoneNumber") : successResult;
      }

      case "verification-email-code": {
        const response = await auth.emailOtp.sendVerificationOtp({
          email: info.identifier,
          type: "email-verification",
        });

        return response.error ? toResult(response, "emailOTP") : successResult;
      }

      case "verification-email-token": {
        const response = await client.sendVerificationEmail({
          email: info.identifier,
          callbackURL: callbackURLs?.newUser ?? callbackURLs?.success,
        });
        return response.error ? toResult(response) : successResult;
      }

      default: {
        const _never: never = info.mode;
        return {
          type: "error",
          message: `Bad State: default case for sendCode hit`,
        };
      }
    }
  };

  const verifyCode: AuthAdapter["verifyCode"] = async (values) => {
    switch (values.mode) {
      case "login-email-code": {
        const response = await auth.signIn.emailOtp({
          email: values.identifier,
          otp: values.code,
        });
        return toResult(response, "emailOTP");
      }

      case "login-phone-code": {
        const response = await auth.phoneNumber.verify({
          phoneNumber: values.identifier,
          code: values.code,
          disableSession: false,
        });
        return toResult(response);
      }

      case "2fa-totp": {
        const response = await auth.twoFactor.verifyTotp({
          code: values.code,
          trustDevice: values.trustDevice,
        });
        return toResult(response, "twoFactor");
      }

      case "2fa-otp": {
        const response = await auth.twoFactor.verifyOtp({
          code: values.code,
          trustDevice: values.trustDevice,
        });
        return toResult(response, "twoFactor");
      }

      case "2fa-backup-code": {
        const response = await auth.twoFactor.verifyBackupCode({
          code: values.code,
          disableSession: false,
          trustDevice: values.trustDevice,
        });
        return toResult(response, "twoFactor");
      }

      case "verification-email-code": {
        const response = await auth.emailOtp.verifyEmail({
          email: values.identifier,
          otp: values.code,
        });
        return toResult(response, "emailOTP");
      }

      case "password-reset-email-code": {
        const response = await auth.emailOtp.checkVerificationOtp({
          email: values.identifier,
          otp: values.code,
          type: "forget-password",
        });
        return response.error
          ? toResult(response, "emailOTP")
          : {
              type: "needs-verification",
              mode: "password-reset-email-code",
              identifier: values.identifier,
            };
      }

      case "login-email-token":
      case "password-reset-phone-code":
      case "password-reset-email-token":
      case "verification-email-token":
        return {
          type: "error",
          message: `Unsupported verification mode: ${values.mode}`,
        };

      default: {
        const _never: never = values.mode;
        return {
          type: "error",
          message: `Bad State: default case for verifyCode hit`,
        };
      }
    }
  };

  const generate2FACredential: AuthAdapter["generate2FACredential"] = async (values) => {
    if (values.type === "backup-codes") {
      return toResult(
        await auth.twoFactor.generateBackupCodes({
          password: values.password,
        }),
        "twoFactor",
      );
    }

    return toResult(
      await auth.twoFactor.getTotpUri({
        password: values.password,
      }),
      "twoFactor",
    );
  };

  return {
    signInWithPassword,
    signUpWithPassword,
    resetPassword,
    changePassword,
    sendCode,
    verifyCode,
    signInWithSocial,
    signInWithPasskey,
    generate2FACredential,
  };
}
