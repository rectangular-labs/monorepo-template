import { Button } from "@rectangular-labs/ui/components/ui/button";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "~/lib/auth";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      className={className}
      disabled={isPending}
      onClick={() =>
        authClient.signOut({
          fetchOptions: {
            onRequest: () => {
              setIsPending(true);
            },
            onError: () => {
              setIsPending(false);
            },
            onSuccess: async () => {
              await router.invalidate();
            },
          },
        })
      }
    >
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}
