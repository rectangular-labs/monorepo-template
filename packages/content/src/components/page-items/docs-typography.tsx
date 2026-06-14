import { cn } from "@rectangular-labs/ui/utils";
import type { ComponentProps } from "react";

/**
 * Add typography styles
 */
export function DocsBody({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} className={cn("prose flex-1", className)}>
      {children}
    </div>
  );
}

export function DocsDescription({ children, className, ...props }: ComponentProps<"p">) {
  if (children === undefined) return null;

  return (
    <p {...props} className={cn("mb-8 text-lg text-muted-foreground", className)}>
      {children}
    </p>
  );
}

export function DocsTitle({ children, className, ...props }: ComponentProps<"h1">) {
  return (
    <h1 {...props} className={cn("text-[1.75em] font-semibold", className)}>
      {children}
    </h1>
  );
}
