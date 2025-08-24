import { LockIcon, MailIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { useAuth } from "./auth-provider";

export function EmailOTPButton() {
  const { view, setView, viewPaths, isSubmitting } = useAuth();
  const toggledView =
    view === viewPaths.EMAIL_OTP ? viewPaths.SIGN_IN : viewPaths.EMAIL_OTP;

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
