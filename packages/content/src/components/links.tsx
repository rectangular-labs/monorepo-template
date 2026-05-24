import BaseLink from "fumadocs-core/link";
import type { ComponentProps } from "react";

export function Link({
  href: defaultUrl = "/",
  ...props
}: ComponentProps<"a"> & {
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
  return <BaseLink href={defaultUrl} {...props} />;
}
