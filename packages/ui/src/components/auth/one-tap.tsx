"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { type OnAuthComplete, useAuth } from "./auth-provider";

interface OneTapProps extends OnAuthComplete {}
export function OneTap({
  onError,
  onSuccess,
  errorRedirect,
  newUserRedirect,
  successRedirect,
}: OneTapProps) {
  const {
    authClient,
    onError: onErrorFallback,
    onSuccess: onSuccessFallback,
    successRedirect: successRedirectFallback,
    errorRedirect: errorRedirectFallback,
    newUserRedirect: newUserRedirectFallback,
  } = useAuth();
  const oneTapFetched = useRef(false);
  const onSuccessRef = useRef(onSuccess || onSuccessFallback);
  const onErrorRef = useRef(onError || onErrorFallback);

  useEffect(() => {
    if (oneTapFetched.current) return;
    oneTapFetched.current = true;

    authClient
      .oneTap({
        ...((successRedirect || successRedirectFallback) && {
          callbackURL: successRedirect ?? successRedirectFallback,
        }),
        ...((errorRedirect || errorRedirectFallback) && {
          errorCallbackURL: errorRedirect ?? errorRedirectFallback,
        }),
        ...((newUserRedirect || newUserRedirectFallback) && {
          newUserCallbackURL: newUserRedirect ?? newUserRedirectFallback,
        }),
        fetchOptions: {
          ...(onSuccessRef.current && {
            onSuccess: onSuccessRef.current,
          }),
          ...(onErrorRef.current && {
            onError: onErrorRef.current,
          }),
        },
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch one-tap",
        );
      });
  }, [
    authClient.oneTap,
    successRedirect,
    errorRedirect,
    newUserRedirect,
    successRedirectFallback,
    errorRedirectFallback,
    newUserRedirectFallback,
  ]);

  return null;
}
