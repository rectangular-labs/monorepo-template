import {
  adminClient,
  emailOTPClient,
  genericOAuthClient,
  magicLinkClient,
  multiSessionClient,
  oidcClient,
  oneTapClient,
  organizationClient,
  phoneNumberClient,
  siweClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient as createAuthClientBase } from "better-auth/react";

export type BaseAuthClient = ReturnType<typeof createAuthClientBase>;
void [
  twoFactorClient,
  usernameClient,
  phoneNumberClient,
  magicLinkClient,
  emailOTPClient,
  genericOAuthClient,
  oneTapClient,
  siweClient,
  adminClient,
  organizationClient,
  oidcClient,
  multiSessionClient,
];
export type CompleteAuthClient = BaseAuthClient;

// Since better auth uses proxy for the client to route frontend calls to the backend, we don't actually need to pass any plugins here.
// the types on the frontend based of the CompleteAuthClient will suffice. The only thing we need to configure is the baseURL and server side plugins.
export const createAuthClient = (options?: { baseURL?: string }): BaseAuthClient => {
  return createAuthClientBase({
    baseURL: options?.baseURL,
    plugins: [],
  });
};
