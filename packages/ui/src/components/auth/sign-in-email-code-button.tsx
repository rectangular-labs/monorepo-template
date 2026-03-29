import { EnvelopeIcon } from "@phosphor-icons/react";
import { cn } from "../../utils";
import { Button } from "../core/button";
import { type AuthViewPath, useAuth } from "./auth-provider";

export function SignInEmailCodeButton({
  view,
  setView,
  isSubmitting,
}: {
  view: AuthViewPath;
  setView: (view: AuthViewPath) => void;
  isSubmitting: boolean;
}) {
  const { viewPaths, defaultFormView } = useAuth();
  const toggledView = view === viewPaths.EMAIL_OTP ? defaultFormView.view : viewPaths.EMAIL_OTP;

  return (
    <Button
      className={cn("w-full")}
      disabled={isSubmitting}
      onClick={() => setView(toggledView)}
      type="button"
      variant="secondary"
    >
      {view === viewPaths.EMAIL_OTP ? <defaultFormView.icon /> : <EnvelopeIcon />}
      {view === viewPaths.EMAIL_OTP ? `Sign in with ${defaultFormView.text}` : "Sign in with email"}
    </Button>
  );
}
