import { PhoneIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { type AuthViewPath, useAuth } from "./auth-provider";

export function SignInPhoneCodeButton({
  view,
  setView,
  isSubmitting,
}: {
  view: AuthViewPath;
  setView: (view: AuthViewPath) => void;
  isSubmitting: boolean;
}) {
  const { viewPaths, defaultFormView } = useAuth();
  const toggledView =
    view === viewPaths.PHONE_OTP ? defaultFormView.view : viewPaths.PHONE_OTP;

  return (
    <Button
      className={cn("w-full")}
      disabled={isSubmitting}
      onClick={() => setView(toggledView)}
      type="button"
      variant="secondary"
    >
      {view === viewPaths.PHONE_OTP ? <defaultFormView.icon /> : <PhoneIcon />}
      {view === viewPaths.PHONE_OTP
        ? `Sign in with ${defaultFormView.text}`
        : "Sign in with phone"}
    </Button>
  );
}
