import { Button } from "@rectangular-labs/ui/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { getRqHelper } from "~/lib/api";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const { mutate: logout, isPending } = useMutation(
    getRqHelper().auth.logout.mutationOptions({
      onSuccess: async () => {
        await router.invalidate();
      },
    }),
  );

  return (
    <Button
      className={className}
      disabled={isPending}
      onClick={() => logout({})}
    >
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}
