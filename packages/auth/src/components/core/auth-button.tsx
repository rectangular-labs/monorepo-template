"use client";

import { Button } from "@rectangular-labs/ui/core/button";
import { Fingerprint } from "@rectangular-labs/ui/components/icons";
import { Spinner } from "@rectangular-labs/ui/core/spinner";
import { useState, type ComponentProps } from "react";
import { SocialProvider } from "../social-providers";

// ─── Props
type ButtonBaseProps = Omit<ComponentProps<typeof Button>, "onClick" | "type"> & {
  layout?: "full" | "icon-only" | undefined;
};

type AuthButtonSocialProps<T extends SocialProvider = SocialProvider> = ButtonBaseProps & {
  type: "social";
  provider: T;
  onAuth: (args: { type: "social"; provider: T }) => void | Promise<void>;
};

type AuthButtonPasskeyProps = ButtonBaseProps & {
  type: "passkey";
  onAuth: (args: { type: "passkey" }) => void | Promise<void>;
};

// ─── Component
export function AuthButton<T extends SocialProvider>(
  props: AuthButtonSocialProps<T> | AuthButtonPasskeyProps,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const layout = props.layout ?? "full";

  const handleClick = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (props.type === "social") {
        await props.onAuth({ type: "social", provider: props.provider });
      } else {
        await props.onAuth({ type: "passkey" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const { disabled, variant = "outline", ...rest } = props;
  // ── Social
  if (rest.type === "social") {
    const { provider } = rest;
    const Icon = provider.icon;

    return (
      <Button
        {...rest}
        disabled={disabled || isSubmitting}
        onClick={() => {
          void handleClick();
        }}
        type="button"
        variant={variant}
      >
        {isSubmitting ? <Spinner /> : <Icon />}
        {layout === "full" ? `Sign in with ${provider.name}` : null}
      </Button>
    );
  }

  // ── Passkey
  return (
    <Button
      {...rest}
      disabled={disabled || isSubmitting}
      onClick={() => {
        void handleClick();
      }}
      type="button"
      variant={variant}
    >
      {isSubmitting ? <Spinner /> : <Fingerprint />}
      {layout === "full" ? "Sign in with passkey" : null}
    </Button>
  );
}
