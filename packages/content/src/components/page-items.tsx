"use client";

import { Pencil } from "@rectangular-labs/ui/components/icons";
import { buttonVariants } from "@rectangular-labs/ui/core/button";
import { cn } from "@rectangular-labs/ui/utils";
import { type ComponentProps, useEffect, useState } from "react";

export function EditOnGitHub(props: ComponentProps<"a">) {
  return (
    <a
      target="_blank"
      rel="noreferrer noopener"
      {...props}
      className={cn(
        buttonVariants({
          variant: "secondary",
          size: "sm",
        }),
        "gap-1.5 not-prose",
        props.className,
      )}
    >
      {props.children ?? (
        <>
          <Pencil className="size-3.5" />
          Edit On GitHub
        </>
      )}
    </a>
  );
}

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

export function PageLastUpdate({
  date: value,
  ...props
}: Omit<ComponentProps<"p">, "children"> & { date: Date }) {
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(value.toLocaleDateString());
  }, [value]);

  return (
    <p {...props} className={cn("text-sm text-muted-foreground", props.className)}>
      Last updated on {date}
    </p>
  );
}

export { MarkdownCopyButton, ViewOptionsPopover } from "./ai/page-actions";
