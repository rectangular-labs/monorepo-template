import { passkeyClient } from "@better-auth/passkey/client";
import { Auth } from "better-auth";
import {
  emailOTPClient,
  genericOAuthClient,
  inferAdditionalFields,
  magicLinkClient,
  organizationClient,
  phoneNumberClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient as createAuthClientBase } from "better-auth/react";

export type CredentialVerificationType = "code" | "token";

// Since better auth uses proxy for the client to route frontend calls to the backend, we don't actually need to pass any plugins here...
export const createAuthClient = (options?: { baseURL?: string }) => {
  const plugins = [
    inferAdditionalFields<Auth>(),
    organizationClient({}),
    // authentication options
    usernameClient(),
    genericOAuthClient(),
    emailOTPClient(),
    magicLinkClient(),
    passkeyClient(),
    phoneNumberClient(),
    // security
    twoFactorClient(),
  ];
  return createAuthClientBase({
    baseURL: options?.baseURL,
    plugins,
  });
};
