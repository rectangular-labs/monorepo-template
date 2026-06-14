import { buttonVariants } from "@rectangular-labs/ui/core/button";
import { cn } from "@rectangular-labs/ui/utils";
import BaseLink from "fumadocs-core/link";
import type { ComponentProps, ReactNode } from "react";

export function Link({
  href: defaultUrl = "/",
  external,
  prefetch,
  ...props
}: ComponentProps<"a"> & {
  prefetch?: boolean | undefined;
  external?: boolean | undefined;
  activeOptions?: {
    exact?: boolean;
    includeHash?: boolean;
    includeSearch?: boolean;
    explicitUndefined?: boolean;
  };
  activeProps?: {
    className?: string;
  };
}) {
  return (
    <BaseLink
      href={defaultUrl}
      {...(external === undefined ? {} : { external })}
      {...(prefetch === undefined ? {} : { prefetch })}
      {...props}
    />
  );
}

export interface LinkIcon {
  label: string;
  href: string;
  icon: ReactNode;
  external?: boolean;
}

export function LinkIcon({ item, className }: { item: LinkIcon; className?: string }) {
  return (
    <Link
      className={cn(buttonVariants({ size: "icon-sm", variant: "ghost" }), className)}
      aria-label={item.label}
      href={item.href}
      external={item.external}
    >
      {item.icon}
    </Link>
  );
}
