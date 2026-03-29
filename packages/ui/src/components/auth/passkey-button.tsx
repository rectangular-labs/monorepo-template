import { FingerprintSimpleIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "../core/button";
import { toast } from "../core/sonner";
import { useAuth } from "./auth-provider";

interface PasskeyButtonProps {
  shouldDisable: boolean;
  setShouldDisable: (shouldDisable: boolean) => void;
}

export function PasskeyButton({ shouldDisable, setShouldDisable }: PasskeyButtonProps) {
  const { authClient, successHandler } = useAuth();
  const auth = authClient as any;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signInPassKey = async () => {
    setShouldDisable(true);
    setIsSubmitting(true);
    const response = await auth.signIn.passkey?.({
      autoFill: true,
    });
    setIsSubmitting(false);
    setShouldDisable(false);

    if (response.error) {
      if (response.error.status === 404) {
        toast.error("Passkey route not found. Have you enabled the passkey plugin?");
        return;
      }
      toast.error(response.error.message ?? "Failed to sign in with passkey");
      return;
    }
    await successHandler();
  };

  return (
    <Button
      className={"w-full"}
      disabled={isSubmitting || shouldDisable}
      formNoValidate
      name="passkey"
      onClick={void signInPassKey}
      value="true"
      variant="secondary"
    >
      {isSubmitting ? <SpinnerIcon className="animate-spin" /> : <FingerprintSimpleIcon />}
      Sign in with passkey
    </Button>
  );
}
