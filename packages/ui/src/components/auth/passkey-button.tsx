import { FingerprintIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { type OnAuthComplete, useAuth } from "./auth-provider";

interface PasskeyButtonProps extends OnAuthComplete {}

export function PasskeyButton({
  onSuccess,
  onError,
  successRedirect,
  errorRedirect,
  newUserRedirect,
}: PasskeyButtonProps) {
  const {
    authClient,
    onError: onErrorFallback,
    onSuccess: onSuccessFallback,
    successRedirect: successRedirectFallback,
    errorRedirect: errorRedirectFallback,
    newUserRedirect: newUserRedirectFallback,
  } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signInPassKey = async () => {
    setIsSubmitting(true);
    try {
      const response = await authClient.signIn.passkey?.({
        fetchOptions: {
          throw: true,
          ...(onSuccess ||
            (onSuccessFallback && {
              onSuccess: onSuccess || onSuccessFallback,
            })),
          ...(onError ||
            (onErrorFallback && { onError: onError || onErrorFallback })),
        },
        autoFill: true,
      });

      onSuccess?.();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      className={"w-full"}
      disabled={isSubmitting}
      formNoValidate
      name="passkey"
      onClick={signInPassKey}
      value="true"
      variant="secondary"
    >
      <FingerprintIcon />
      Sign in with passkey
    </Button>
  );
}
