import { LockIcon, PhoneIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { type AuthViewPath, useAuth } from "./auth-provider";

export function SignInPhoneOTPButton({
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
    view === viewPaths.PHONE_OTP
      ? viewPaths.SIGN_IN_PASSWORD
      : viewPaths.PHONE_OTP;

  return (
    <Button
      className={cn("w-full")}
      disabled={isSubmitting}
      onClick={() => setView(toggledView)}
      type="button"
      variant="secondary"
    >
      {view === viewPaths.PHONE_OTP ? <LockIcon /> : <PhoneIcon />}
      {view === viewPaths.PHONE_OTP
        ? "Sign in with password"
        : "Sign in with phone OTP"}
    </Button>
  );
}
