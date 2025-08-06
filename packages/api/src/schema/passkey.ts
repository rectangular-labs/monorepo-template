import { type } from "arktype";

// Common WebAuthn types
const authenticatorAttachmentType = type("'cross-platform' | 'platform'");
const transportType = type(
  "('ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb')[]",
);
const publicKeyCredentialType = type("'public-key'");
const userVerificationType = type("('required' | 'preferred' | 'discouraged')");
const residentKeyType = type("('required' | 'preferred' | 'discouraged')");
const attestationType = type("('direct' | 'enterprise' | 'indirect' | 'none')");
const hintsType = type("('hybrid' | 'security-key' | 'client-device')[]");
const attestationFormatsType = type(
  "('fido-u2f' | 'packed' | 'android-safetynet' | 'android-key' | 'tpm' | 'apple' | 'none')[]",
);

// Common credential structure
const credentialDescriptorType = type({
  id: "string",
  type: publicKeyCredentialType,
  "transports?": transportType,
});

// Common extension types
const extensionsType = type({
  "appid?": "string",
  "credProps?": "boolean",
  "hmacCreateSecret?": "boolean",
  "minPinLength?": "boolean",
});

const clientExtensionResultsType = type({
  "appid?": "boolean",
  "credProps?": type({
    "rk?": "boolean",
  }),
  "hmacCreateSecret?": "boolean",
});

// Registration related schemas;
export const registrationOptionsSchema = type({
  rp: {
    name: "string",
    "id?": "string",
  },
  user: {
    id: "string",
    name: "string",
    displayName: "string",
  },
  challenge: "string",
  pubKeyCredParams: type({
    alg: "number",
    type: publicKeyCredentialType,
  }).array(),
  "timeout?": "number",
  "excludeCredentials?": credentialDescriptorType.array(),
  "authenticatorSelection?": type({
    "authenticatorAttachment?": authenticatorAttachmentType,
    "requireResidentKey?": "boolean",
    "residentKey?": residentKeyType,
    "userVerification?": userVerificationType,
  }),
  "hints?": hintsType,
  "attestation?": attestationType,
  "attestationFormats?": attestationFormatsType,
  "extensions?": extensionsType,
});

export const finishRegistrationInputSchema = type({
  username: "string",
  registration: type({
    id: "string",
    rawId: "string",
    response: type({
      clientDataJSON: "string",
      attestationObject: "string",
      "authenticatorData?": "string",
      "transports?": transportType,
      "publicKeyAlgorithm?": "number",
      "publicKey?": "string",
    }),
    "authenticatorAttachment?": authenticatorAttachmentType,
    clientExtensionResults: clientExtensionResultsType,
    type: publicKeyCredentialType,
  }),
});

// Login related schemas
export const authenticationOptionsSchema = type({
  challenge: "string",
  "timeout?": "number",
  "rpId?": "string",
  allowCredentials: credentialDescriptorType.array().optional(),
});

export const finishLoginInputSchema = type({
  id: "string",
  rawId: "string",
  response: type({
    clientDataJSON: "string",
    authenticatorData: "string",
    signature: "string",
    "userHandle?": "string",
  }),
  clientExtensionResults: clientExtensionResultsType,
  type: publicKeyCredentialType,
});
