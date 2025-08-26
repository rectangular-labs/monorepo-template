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
  phoneNumberClient,
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
    phoneNumberClient(),
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

// Since better auth uses proxy for the client to route frontend calls to the backend, we don't actually need to pass any plugins here.
// the types on the frontend based of the CompleteAuthClient will suffice. The only thing we need to configure is the baseURL and server side plugins.
export const createAuthClient = () => {
  const env = authEnv();
  return createAuthClientBase({
    baseURL: env.VITE_APP_URL,
    plugins: [],
  });
};
