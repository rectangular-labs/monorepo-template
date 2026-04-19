import { AuthButton } from "@rectangular-labs/auth/components/core/auth-button";
import { EmailIdentifierForm } from "@rectangular-labs/auth/components/forms/email-identifier";
import { PasswordSignInForm } from "@rectangular-labs/auth/components/forms/password-sign-in";
import { PasswordSignUpForm } from "@rectangular-labs/auth/components/forms/password-sign-up";
import { VerificationForm } from "@rectangular-labs/auth/components/forms/verification";
import {
  useAuthFlow,
  type UseAuthFlowReturn,
} from "@rectangular-labs/auth/components/use-auth-flow";
import { createFileRoute } from "@tanstack/react-router";

import { socialProviders } from "@rectangular-labs/auth/components/social-providers";
import { type } from "arktype";
import { authAdapter, createLoginCallbackURLs } from "~/lib/auth";
import { clientEnv } from "~/lib/env";
import { AuthPageFrame } from "./-shared";

export const authProviders = socialProviders.filter((provider) =>
  ["github", "google", "discord"].includes(provider.provider),
);

export const Route = createFileRoute("/login/")({
  validateSearch: type({
    "next?": "string",
  }),
  component: LoginPage,
});

function LoginPage() {
  const { next } = Route.useSearch();
  const navigate = Route.useNavigate();

  const callbackURLs = createLoginCallbackURLs(next);

  const flow = useAuthFlow({
    adapter: authAdapter,
    callbackURLs,
    onTransition: async (state) => {
      if (state.step === "reset-password") {
        await navigate({
          search: (prev) => ({
            ...prev,
            identifier: state.identifier,
          }),
          to: "/login/reset-password",
        });
      }
    },
    navigate: (url) =>
      navigate({
        href: url,
      }),
  });

  const title = (() => {
    switch (flow.state.step) {
      case "sign-up":
        return "Create your account.";
      case "forgot-password":
      case "reset-password":
        return "Reset your password.";
      case "2fa":
        return "Verify your second factor.";
      case "recover-account":
        return "Use a backup code.";
      case "verification":
        return "Verify your identity.";
      default:
        return "Sign in.";
    }
  })();
  const content = (() => {
    switch (flow.state.step) {
      case "sign-in":
        return <SignInStep flow={flow} />;
      case "sign-up":
        return <SignUpStep flow={flow} />;
      case "forgot-password":
      case "reset-password":
        return <ForgotPasswordStep flow={flow} />;
      case "verification":
        return <VerificationStep flow={flow} />;
      case "2fa":
      case "recover-account":
        throw new Error("2fa and recover-account are not supported yet");
      default:
        return null;
    }
  })();

  return (
    <AuthPageFrame
      description={
        <>
          After authentication you&apos;ll be redirected back to{" "}
          <span className="font-medium text-foreground">{callbackURLs.success}</span>.
        </>
      }
      title={title}
    >
      {content}
    </AuthPageFrame>
  );
}

function SignInStep({ flow }: { flow: UseAuthFlowReturn }) {
  return (
    <>
      <PasswordSignInForm
        onSubmit={(values) =>
          flow.auth.signInWithPassword({
            type: "email",
            email: values.email,
            password: values.password,
            rememberMe: values.rememberMe,
          })
        }
        onForgotPassword={() => {
          flow.goTo({ step: "forgot-password" });
        }}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="flex gap-3">
        {authProviders.map((provider) => (
          <AuthButton
            className="flex-1"
            key={provider.provider}
            layout="full"
            onAuth={async () => {
              await flow.auth.signInWithSocial(provider.provider, {
                method: provider.method,
              });
            }}
            provider={provider}
            type="social"
          />
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <button
          className="font-medium text-foreground underline-offset-4 hover:underline"
          onClick={() => flow.goTo({ step: "sign-up" })}
          type="button"
        >
          Sign up
        </button>
      </p>
    </>
  );
}

function SignUpStep({ flow }: { flow: UseAuthFlowReturn }) {
  return (
    <>
      <PasswordSignUpForm
        onSubmit={(values) =>
          flow.auth.signUpWithPassword({
            email: values.email,
            password: values.password,
            name: values.name,
          })
        }
        options={{ showName: true, showConfirmPassword: true }}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="flex gap-3">
        {authProviders.map((provider) => (
          <AuthButton
            className="flex-1"
            key={provider.provider}
            layout="full"
            onAuth={async () => {
              await flow.auth.signInWithSocial(provider.provider, {
                method: provider.method,
                requestSignUp: true,
              });
            }}
            provider={provider}
            type="social"
          />
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          className="font-medium text-foreground underline-offset-4 hover:underline"
          onClick={() => flow.goTo({ step: "sign-in" })}
          type="button"
        >
          Sign in
        </button>
      </p>
    </>
  );
}

function ForgotPasswordStep({ flow }: { flow: UseAuthFlowReturn }) {
  const verificationType = clientEnv().VITE_AUTH_EMAIL_VERIFICATION_TYPE;

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you {verificationType === "code" ? "a code" : "a link"}{" "}
        to reset your password.
      </p>
      <EmailIdentifierForm
        onSubmit={(values) =>
          flow.auth.sendCode({
            identifier: values.email,
            mode:
              verificationType === "code"
                ? "password-reset-email-code"
                : "password-reset-email-token",
          })
        }
        submitText="Send reset link"
      />
      <button
        className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
        onClick={() => flow.goBack()}
        type="button"
      >
        Back to sign in
      </button>
    </>
  );
}

function VerificationStep({ flow }: { flow: UseAuthFlowReturn }) {
  if (flow.state.step !== "verification") {
    return null;
  }

  const { info } = flow.state;

  return (
    <>
      <VerificationForm
        info={info}
        onResend={() => flow.auth.sendCode(info)}
        onSubmit={(values) => flow.auth.verifyCode({ ...info, code: values.code })}
      />

      {flow.canGoBack ? (
        <button
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => flow.goBack()}
          type="button"
        >
          Go back
        </button>
      ) : null}
    </>
  );
}
