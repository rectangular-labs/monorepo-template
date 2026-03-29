import { SpinnerIcon } from "@phosphor-icons/react";
import { cn } from "@rectangular-labs/ui/utils";

function Spinner({ className, color, ...props }: React.ComponentProps<"svg">) {
  return (
    <SpinnerIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
      {...(color ? { color } : {})}
    />
  );
}

export { Spinner };
