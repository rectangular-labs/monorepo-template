import { LockIcon, MailIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { useAuth } from "./auth-provider";

export function MagicLinkButton() {
  const { view, setView, viewPaths, isSubmitting } = useAuth();

  const toggledView =
    view === viewPaths.MAGIC_LINK ? viewPaths.SIGN_IN : viewPaths.MAGIC_LINK;

  return (
    <Button
      className={cn("w-full")}
      disabled={isSubmitting}
      onClick={() => setView(toggledView)}
      type="button"
      variant="secondary"
    >
      {view === viewPaths.MAGIC_LINK ? <LockIcon /> : <MailIcon />}
      {view === viewPaths.MAGIC_LINK
        ? "Sign in with password"
        : "Sign in with magic link"}
    </Button>
  );
}
