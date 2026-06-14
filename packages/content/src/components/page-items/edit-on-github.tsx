"use client";

import { Pencil } from "@rectangular-labs/ui/components/icons";
import { buttonVariants } from "@rectangular-labs/ui/core/button";
import { cn } from "@rectangular-labs/ui/utils";
import type { ComponentProps } from "react";

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
