import { useState } from "react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { toast } from "../ui/sonner";
import { type OnAuthComplete, useAuth } from "./auth-provider";
import type { Provider } from "./social-providers";

interface ProviderButtonProps extends OnAuthComplete {
  className?: string;
  provider: Provider;
  type: "generic-oauth" | "social";
  socialLayout: "auto" | "horizontal" | "grid" | "vertical";
}

export function ProviderButton({
  className,
  provider,
  socialLayout,
  type = "social",
  errorRedirect,
  newUserRedirect,
  successRedirect,
  onError,
  onSuccess,
}: ProviderButtonProps) {
  const {
    onSuccess: onSuccessFallback,
    onError: onErrorFallback,
    successRedirect: successRedirectFallback,
    errorRedirect: errorRedirectFallback,
    newUserRedirect: newUserRedirectFallback,
    authClient,
  } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const doSignInSocial = async () => {
    setIsSubmitting(true);

    const fetchOptions = {
      throw: true,
      ...((onSuccess || onSuccessFallback) && {
        onSuccess: onSuccess || onSuccessFallback,
      }),
      ...((onError || onErrorFallback) && {
        onError: onError || onErrorFallback,
      }),
    };
    const callbackValues = {
      callbackURL: successRedirect ?? successRedirectFallback,
      errorCallbackURL: errorRedirect ?? errorRedirectFallback,
      newUserCallbackURL: newUserRedirect ?? newUserRedirectFallback,
    };

    try {
      if (type === "social") {
        await authClient.signIn.social({
          provider: provider.provider,
          fetchOptions,
          ...callbackValues,
        });
      } else {
        await authClient.signIn.oauth2({
          providerId: provider.provider,
          fetchOptions,
          ...callbackValues,
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      className={cn(socialLayout === "vertical" ? "w-full" : "grow", className)}
      disabled={isSubmitting}
      onClick={doSignInSocial}
      variant="outline"
    >
      {provider.icon && <provider.icon />}
      {socialLayout === "grid" && provider.name}
      {socialLayout === "vertical" && `Sign in with ${provider.name}`}
    </Button>
  );
}
