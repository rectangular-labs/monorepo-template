import { Buffer } from "node:buffer";
import { ORPCError } from "@orpc/client";
import { eq, schema } from "@rectangular-labs/db";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { type } from "arktype";
import { base } from "../../context";
import { apiEnv } from "../../env";
import { useSession } from "../../lib/session";
import {
  authenticationOptionsSchema,
  finishLoginInputSchema,
  finishRegistrationInputSchema,
  registrationOptionsSchema,
} from "../../schema/passkey";
import { getAuthedSession } from "./common";

function getWebAuthnConfig() {
  const rpID = process.env.WEBAUTHN_RP_ID || "localhost";
  const rpName =
    process.env.NODE_ENV === "development"
      ? "Development App"
      : process.env.WEBAUTHN_APP_NAME || "My App";

  return {
    rpName,
    rpID,
  };
}

const getChallengeSession = async () => {
  return await useSession<{ challenge: string }>({
    name: "webauthn_challenge",
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      maxAge: 5 * 60 * 1000, // 5 minutes
    },
    password: apiEnv().ENCRYPTION_KEY,
  });
};

// Route to start passkey registration
const startRegistration = base
  .route({
    method: "POST",
    path: "/register/start",
  })
  .input(
    type({
      username: "string.alphanumeric >= 4",
    }),
  )
  .output(registrationOptionsSchema)
  .handler(async ({ input }) => {
    const { rpName, rpID } = getWebAuthnConfig();

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: input.username,
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "preferred",
      },
    });
    const session = await getChallengeSession();
    await session.update({
      challenge: options.challenge,
    });

    return options;
  });

// Route to start passkey login
const startLogin = base
  .route({
    method: "POST",
    path: "/login/start",
  })
  .input(type({}))
  .output(authenticationOptionsSchema)
  .handler(async () => {
    const { rpID } = getWebAuthnConfig();

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "preferred",
      allowCredentials: [],
    });

    const session = await getChallengeSession();
    await session.update({
      challenge: options.challenge,
    });

    return options;
  });

// Route to finish passkey registration
const finishRegistration = base
  .route({
    method: "POST",
    path: "/register/finish",
  })
  .input(finishRegistrationInputSchema)
  .output(type({ success: "true" }))
  .handler(async ({ input, context }) => {
    const { rpID } = getWebAuthnConfig();

    const { db, url } = context;

    const challengeSession = await getChallengeSession();
    const authedSession = await getAuthedSession();

    if (!challengeSession.data?.challenge) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Invalid session state",
      });
    }
    const { challenge } = challengeSession.data;

    const verification = await verifyRegistrationResponse({
      response: input.registration,
      expectedChallenge: challenge,
      expectedOrigin: url.origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Invalid registration response",
      });
    }
    challengeSession.clear();

    // Create user
    const [user] = await db
      .insert(schema.userTable)
      .values({
        username: input.username,
      })
      .returning();

    if (!user) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create user",
      });
    }

    // Create credential
    await db.insert(schema.credentialTable).values({
      credentialId: verification.registrationInfo.credential.id,
      userId: user.id,
      publicKey: Buffer.from(
        verification.registrationInfo.credential.publicKey,
      ).toString("base64"),
      counter: verification.registrationInfo.credential.counter,
    });

    await authedSession.update({
      userId: user.id,
    });

    return { success: true };
  });

// Route to finish passkey login
const finishLogin = base
  .route({
    method: "POST",
    path: "/login/finish",
  })
  .input(finishLoginInputSchema)
  .output(type({ success: "true", userId: "number" }))
  .handler(async ({ input, context }) => {
    const { rpID } = getWebAuthnConfig();

    const { db, url } = context;

    const challengeSession = await getChallengeSession();
    const authedSession = await getAuthedSession();

    if (!challengeSession.data) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Invalid session state",
      });
    }
    const { challenge } = challengeSession.data;

    // Find credential
    const credential = await db.query.credentialTable.findFirst({
      where: (table, { eq }) => eq(table.credentialId, input.id),
    });

    if (!credential) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Invalid credentials",
      });
    }

    const verification = await verifyAuthenticationResponse({
      response: input,
      expectedChallenge: challenge,
      expectedOrigin: url.origin,
      expectedRPID: rpID,
      requireUserVerification: false,
      credential: {
        id: credential.credentialId,
        publicKey: Buffer.from(credential.publicKey, "base64"),
        counter: credential.counter,
      },
    });

    if (!verification.verified) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Invalid login response",
      });
    }
    await challengeSession.clear();

    // Update counter
    await db
      .update(schema.credentialTable)
      .set({
        counter: verification.authenticationInfo.newCounter,
      })
      .where(eq(schema.credentialTable.credentialId, input.id));

    // Find user
    const user = await db.query.userTable.findFirst({
      where: (table, { eq }) => eq(table.id, credential.userId),
    });

    if (!user) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Bad credentials",
      });
    }
    await authedSession.update({
      userId: user.id,
    });

    return { success: true, userId: user.id };
  });

export default base.prefix("/auth/passkey").router({
  startRegistration,
  finishRegistration,
  startLogin,
  finishLogin,
});
