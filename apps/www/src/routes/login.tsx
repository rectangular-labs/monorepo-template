import { ThemeToggle } from "@rectangular-labs/ui/components/theme-provider";
import { Button } from "@rectangular-labs/ui/components/ui/button";
import { Input } from "@rectangular-labs/ui/components/ui/input";
import { Label } from "@rectangular-labs/ui/components/ui/label";
import { Separator } from "@rectangular-labs/ui/components/ui/separator";
import { Toaster, toast } from "@rectangular-labs/ui/components/ui/sonner";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { useState } from "react";
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
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const sendOtp = async (email: string) => {
    const { error } = await authClient.emailOtp.sendVerificationOtp({
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
    const { error } = await authClient.signIn.emailOtp({ email, otp });
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
      await authClient.signIn.social({
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                autoComplete="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </div>
            <Button
              className="w-full"
              disabled={!email || isSending}
              onClick={async () => {
                setIsSending(true);
                try {
                  await sendOtp(email);
                  setOtpSent(true);
                } finally {
                  setIsSending(false);
                }
              }}
            >
              {isSending ? "Sending..." : otpSent ? "Resend code" : "Send code"}
            </Button>
            {otpSent ? (
              <div className="space-y-2">
                <Label htmlFor="otp">Verification code</Label>
                <Input
                  autoComplete="one-time-code"
                  id="otp"
                  inputMode="numeric"
                  onChange={(e) => setOtp(e.target.value)}
                  pattern="[0-9]*"
                  placeholder="6-digit code"
                  value={otp}
                />
                <Button
                  className="w-full"
                  disabled={!otp || isVerifying}
                  onClick={async () => {
                    setIsVerifying(true);
                    try {
                      await verifyOtp({ email, otp });
                    } finally {
                      setIsVerifying(false);
                    }
                  }}
                >
                  {isVerifying ? "Verifying..." : "Verify & sign in"}
                </Button>
              </div>
            ) : null}
          </div>

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

          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={() => signInWithProvider("github")}
              variant="outline"
            >
              Continue with GitHub
            </Button>
            <Button
              className="w-full"
              onClick={() => signInWithProvider("discord")}
              variant="outline"
            >
              Continue with Discord
            </Button>
          </div>
        </div>
        <Toaster />
      </div>
    </div>
  );
}
