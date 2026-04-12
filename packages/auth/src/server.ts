import { expo } from "@better-auth/expo";
import { passkey } from "@better-auth/passkey";
import { createEmailClient } from "@rectangular-labs/emails";
import type { BetterAuthOptions } from "better-auth";
import { DB, drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import {
  emailOTP,
  haveIBeenPwned,
  magicLink,
  oAuthProxy,
  organization,
  twoFactor,
} from "better-auth/plugins";
import { v7 as uuidv7 } from "uuid";
import { CredentialVerificationType } from "./client";

export function initAuthHandler({
  baseURL,
  db,
  encryptionKey,
  fromEmail,
  credentialVerificationType,
  discordClientId,
  discordClientSecret,
  githubClientId,
  githubClientSecret,
  redditClientId,
  redditClientSecret,
  googleClientId,
  googleClientSecret,
}: {
  baseURL: string;
  credentialVerificationType?: CredentialVerificationType | undefined;
  db: DB;
  encryptionKey: string;
  fromEmail: string;
  discordClientId?: string | undefined;
  discordClientSecret?: string | undefined;
  githubClientId?: string | undefined;
  githubClientSecret?: string | undefined;
  googleClientId?: string | undefined;
  googleClientSecret?: string | undefined;
  redditClientId?: string | undefined;
  redditClientSecret?: string | undefined;
}) {
  const useDiscord = !!discordClientId && !!discordClientSecret;
  const useGithub = !!githubClientId && !!githubClientSecret;
  const useReddit = !!redditClientId && !!redditClientSecret;
  const useGoogle = !!googleClientId && !!googleClientSecret;

  const domain = new URL(baseURL).hostname.split(".").slice(-2).join(".");
  const isPreview = baseURL.startsWith("https://pr-") || baseURL.startsWith("https://preview.");

  const redirectUrl = isPreview
    ? `https://preview.${domain}` // preview.rectangularlabs.com
    : baseURL; // prod / localhost domains

  const emailDriver = createEmailClient();

  const config = {
    baseURL,
    secret: encryptionKey,
    account: {
      encryptOAuthTokens: false,
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
      },
    },
    user: {
      changeEmail: {
        enabled: true,
        sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
          await emailDriver.send({
            from: fromEmail,
            to: user.email,
            subject: "Approve email change",
            text: `Click the link to approve the change to ${newEmail}: ${url}`,
          });
        },
      },
      additionalFields: {
        source: {
          type: "string",
          required: false,
        },
        goal: {
          type: "string",
          required: false,
        },
      },
    },
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    telemetry: {
      enabled: false,
    },
    onAPIError: {
      errorURL: "/login",
    },
    emailAndPassword: {
      enabled: !!credentialVerificationType,
      requireEmailVerification: true,
      autoSignIn: true,
      sendResetPassword: async (data) => {
        if (credentialVerificationType === "code") {
          throw new Error("Password reset should be done through the email OTP plugin");
        }
        await emailDriver.send({
          from: fromEmail,
          to: data.user.email,
          subject: "Reset your password",
          text: `Reset your password at ${data.url}`,
        });
      },
    },
    emailVerification: {
      ...(credentialVerificationType === "token" && {
        sendVerificationEmail: async ({ user, url }) => {
          await emailDriver.send({
            from: fromEmail,
            to: user.email,
            subject: "Verify your email",
            text: `Verify your email at ${url}`,
          });
        },
      }),
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      expiresIn: 3600,
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user, ctx) => {
            const deriveNameFromEmail = (email: string) => {
              if (!email) return "";
              const localPart = email.split("@")[0]?.trim();
              if (!localPart) return "";
              return localPart.replace(/[._+-]+/g, " ").trim();
            };
            if (ctx?.path === "/sign-up/email") {
              // Temporary fix for better-auth issue https://github.com/better-auth/better-auth/issues/424
              if (user.name === user.email) {
                const derivedName = deriveNameFromEmail(user.email);
                return {
                  data: {
                    ...user,
                    name: derivedName,
                  },
                };
              }
            }
            return await Promise.resolve({ data: user });
          },
        },
      },
    },
    plugins: [
      oAuthProxy({
        productionURL: isPreview
          ? // this is so that the preview server will proxy request without state checks.
            // under the hood better auth doesn't allow proxying if the baseUrl === productionUrl.
            // https://github.com/better-auth/better-auth/commit/2d64fe38#diff-b1ff58ed51c13c92048fae09d3623dcdac496968932823c956661cd81f292cbb
            // also technically the "production url" is the one below and not preview.{base_domain}
            redirectUrl.replace("preview.", "")
          : redirectUrl,
      }),
      haveIBeenPwned(),
      emailOTP({
        overrideDefaultEmailVerification: credentialVerificationType === "code",
        async sendVerificationOTP({ email, otp }) {
          await emailDriver.send({
            from: fromEmail,
            to: email,
            subject: `${otp} is your verification code`,
            text: `Your one-time verification code is ${otp}`,
          });
        },
      }),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await emailDriver.send({
            from: fromEmail,
            to: email,
            subject: "Your login link",
            text: `Your login link is ${url}`,
          });
        },
      }),
      passkey(),
      twoFactor(),
      organization({
        sendInvitationEmail: async ({ email, id, organization, inviter }) => {
          const inviteUrl = `${baseURL}/invite/${id}`;
          const result = await emailDriver.send({
            from: fromEmail,
            to: email,
            subject: `You have been invited to join ${organization.name} by ${inviter.user.name}`,
            text: `You have been invited to join ${organization.name} by ${inviter.user.name}.\n\nClick the link below to accept the invitation:\n${inviteUrl}`,
          });
          if (!result.success) {
            throw result.error;
          }
        },
        organizationHooks: {
          beforeCreateOrganization: ({ organization }) => {
            if (organization.slug === "organization") {
              throw new Error("Organization slug is already taken");
            }
            return Promise.resolve();
          },
          beforeUpdateOrganization: ({ organization }) => {
            if (organization.slug === "organization") {
              throw new Error("Organization slug is already taken");
            }
            return Promise.resolve();
          },
        },
      }),
      expo(),
    ],
    socialProviders: {
      ...(useDiscord && {
        discord: {
          clientId: discordClientId,
          clientSecret: discordClientSecret,
          redirectURI: `${redirectUrl}/api/auth/callback/discord`,
        },
      }),
      ...(useGithub && {
        github: {
          clientId: githubClientId,
          clientSecret: githubClientSecret,
          redirectURI: `${redirectUrl}/api/auth/callback/github`,
        },
      }),
      ...(useReddit && {
        reddit: {
          clientId: redditClientId,
          clientSecret: redditClientSecret,
          redirectURI: `${redirectUrl}/api/auth/callback/reddit`,
        },
      }),
      ...(useGoogle && {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          redirectURI: `${redirectUrl}/api/auth/callback/google`,
          accessType: "offline",
          prompt: "select_account consent",
        },
      }),
    },
    experimental: {
      joins: true,
    },
    advanced: {
      cookiePrefix: domain.split(".").at(0) ?? "",
      useSecureCookies: true,
      database: {
        generateId: () => uuidv7(),
      },
    },
    trustedOrigins: ["expo://", redirectUrl, baseURL],
  } as const satisfies BetterAuthOptions;

  return betterAuth(config) as ReturnType<typeof betterAuth<typeof config>>;
}

export type Auth = ReturnType<typeof initAuthHandler>;
