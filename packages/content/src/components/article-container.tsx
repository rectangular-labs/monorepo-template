"use client";

import { cn } from "@rectangular-labs/ui/utils";
import type { ComponentProps } from "react";

export interface ContainerProps extends ComponentProps<"article"> {
  full?: boolean;
}

export function ArticleContainer({ full = false, ...props }: ContainerProps) {
  return (
    <article
      id="nd-page"
      data-full={full}
      {...props}
      className={cn(
        "flex flex-col w-full max-w-[900px] mx-auto [grid-area:main] px-4 py-6 gap-4 md:px-6 md:pt-8 xl:px-8 xl:pt-14",
        full && "max-w-6xl",
        props.className,
      )}
    >
      {props.children}
    </article>
  );
}
