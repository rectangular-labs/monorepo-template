import {
  adminClient,
  apiKeyClient,
  emailOTPClient,
  genericOAuthClient,
  magicLinkClient,
  multiSessionClient,
  oidcClient,
  oneTapClient,
  organizationClient,
  passkeyClient,
  siweClient,
  ssoClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient as createAuthClientBase } from "better-auth/react";
import { authEnv } from "./env";

export type BaseAuthClient = ReturnType<typeof createAuthClientBase>;
// used to generate the types for the complete auth client
const _authClient = createAuthClientBase({
  plugins: [
    twoFactorClient(),
    usernameClient(),
    magicLinkClient(),
    emailOTPClient(),
    passkeyClient(),
    genericOAuthClient(),
    oneTapClient({
      clientId: "",
    }),
    siweClient(),
    // authorization
    adminClient(),
    apiKeyClient(),
    // enterprise
    organizationClient(),
    oidcClient(),
    ssoClient(),
    // utility
    multiSessionClient(),
  ],
});
export type CompleteAuthClient = typeof _authClient;

export type AuthClient = ReturnType<
  typeof createAuthClientBase<{
    plugins: [ReturnType<typeof emailOTPClient>];
  }>
>;
export const createAuthClient = (): AuthClient => {
  const env = authEnv();
  return createAuthClientBase({
    baseURL: env.VITE_APP_URL,
    plugins: [emailOTPClient()],
  });
};
