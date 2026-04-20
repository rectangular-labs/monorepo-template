"use client";

import type { AuthResult } from "@rectangular-labs/auth/adapter/types";
import { Button } from "@rectangular-labs/ui/core/button";
import { toast } from "@rectangular-labs/ui/core/sonner";
import { useState } from "react";

export type ResendVerificationProps = {
  item: "code" | "link";
  onResend: () => Promise<AuthResult>;
};

export function ResendVerification({ item, onResend }: ResendVerificationProps) {
  const [isResending, setIsResending] = useState(false);

  function handleResend() {
    setIsResending(true);
    toast.promise(
      onResend().finally(() => setIsResending(false)),
      {
        loading: `Sending a new ${item}...`,
        success: (result) => {
          if (result.type === "error") {
            throw new Error(result.message);
          }
          return item === "code" ? "New code sent." : "New link sent.";
        },
        error: (e) => {
          if (e instanceof Error) {
            return e.message;
          }
          return `Something went wrong sending a new ${item}. Please try again later.`;
        },
        dismissible: true,
      },
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      Didn&apos;t receive a {item}?{" "}
      <Button
        className="px-0"
        disabled={isResending}
        onClick={() => {
          handleResend();
        }}
        type="button"
        variant="link"
      >
        Resend {item}
      </Button>
    </div>
  );
}
