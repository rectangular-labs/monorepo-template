import { EnvelopeIcon } from "@phosphor-icons/react";
import { Button } from "../core/button";
import { type AuthViewPath, useAuth } from "./auth-provider";

export function SignInMagicLinkButton({
  view,
  setView,
  isSubmitting,
}: {
  view: AuthViewPath;
  setView: (view: AuthViewPath) => void;
  isSubmitting: boolean;
}) {
  const { viewPaths, defaultFormView } = useAuth();
  const toggledView = view === viewPaths.MAGIC_LINK ? defaultFormView.view : viewPaths.MAGIC_LINK;

  return (
    <Button
      className={"w-full"}
      disabled={isSubmitting}
      onClick={() => setView(toggledView)}
      type="button"
      variant="secondary"
    >
      {view === viewPaths.MAGIC_LINK ? <defaultFormView.icon /> : <EnvelopeIcon />}
      {view === viewPaths.MAGIC_LINK
        ? `Sign in with ${defaultFormView.text}`
        : "Sign in with magic link"}
    </Button>
  );
}
