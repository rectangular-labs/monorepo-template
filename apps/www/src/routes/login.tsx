import { EmailOtpForm } from "@rectangular-labs/ui/components/auth/email-otp-form";
import { SocialLoginButtons } from "@rectangular-labs/ui/components/auth/social-login-buttons";
import { ThemeToggle } from "@rectangular-labs/ui/components/theme-provider";
import { Separator } from "@rectangular-labs/ui/components/ui/separator";
import { Toaster, toast } from "@rectangular-labs/ui/components/ui/sonner";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { authClient, getCurrentSession } from "~/lib/auth";

export const Route = createFileRoute("/login")({
  validateSearch: type({
    "next?": "string",
  }),
  loaderDeps: ({ search }) => {
    return {
      next: search.next,
    };
  },
  loader: async ({ deps }) => {
    const session = await getCurrentSession();
    if (session && deps.next) {
      return redirect({ to: deps.next });
    }
    return;
  },
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();

  const sendOtp = async (email: string) => {
    const { error } = await authClient().emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    if (error) {
      toast.error(error.message ?? "Failed to send code");
    } else {
      toast.success("Code sent. Check console (dev only) and your email.");
    }
  };

  const verifyOtp = async ({ email, otp }: { email: string; otp: string }) => {
    const { error } = await authClient().signIn.emailOtp({ email, otp });
    if (error) {
      toast.error(error.message ?? "Invalid code. Try again.");
    } else {
      toast.success("Signed in");
      await navigate({ to: next ?? "/" });
    }
  };

  const signInWithProvider = async (
    provider: "github" | "discord" | string,
  ) => {
    try {
      await authClient().signIn.social({
        provider,
        callbackURL: next ?? "/",
        errorCallbackURL: "/login",
      });
    } catch {
      toast.error("Social sign-in failed");
    }
  };

  return (
    <div className="min-h-screen">
      <ThemeToggle className="absolute top-4 right-4" />

      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16">
        <h1 className="mb-8 font-bold text-4xl tracking-tight">Sign in</h1>

        <div className="w-full max-w-lg space-y-6">
          <SocialLoginButtons onProviderClick={signInWithProvider} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <EmailOtpForm onSendOtp={sendOtp} onVerifyOtp={verifyOtp} />
        </div>
        <Toaster />
      </div>
    </div>
  );
}
