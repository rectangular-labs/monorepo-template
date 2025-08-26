import { LockIcon, MailIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { type AuthViewPath, useAuth } from "./auth-provider";

export function SignInEmailOTPButton({
  view,
  setView,
  isSubmitting,
}: {
  view: AuthViewPath;
  setView: (view: AuthViewPath) => void;
  isSubmitting: boolean;
}) {
  const { viewPaths } = useAuth();
  const toggledView =
    view === viewPaths.EMAIL_OTP
      ? viewPaths.SIGN_IN_PASSWORD
      : viewPaths.EMAIL_OTP;

  return (
    <Button
      className={cn("w-full")}
      disabled={isSubmitting}
      onClick={() => setView(toggledView)}
      type="button"
      variant="secondary"
    >
      {view === viewPaths.EMAIL_OTP ? <LockIcon /> : <MailIcon />}
      {view === viewPaths.EMAIL_OTP
        ? "Sign in with password"
        : "Sign in with email OTP"}
    </Button>
  );
}
