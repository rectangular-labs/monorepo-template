"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./auth-provider";

export function OneTap() {
  const { authClient, successCallbackURL } = useAuth();
  const oneTapFetched = useRef(false);

  useEffect(() => {
    if (oneTapFetched.current) return;
    oneTapFetched.current = true;

    authClient
      .oneTap({
        callbackURL: successCallbackURL,
        fetchOptions: {
          throw: true,
        },
      })
      .catch((e) => {
        if (e instanceof Error && e.message.includes("Not Found")) {
          console.warn("Route not found. Did you enable the `oneTap` plugin?");
        }
      });
  }, [authClient, successCallbackURL]);

  return null;
}
