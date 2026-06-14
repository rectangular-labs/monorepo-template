"use client";

import { cn } from "@rectangular-labs/ui/utils";
import type { ComponentProps } from "react";
import { Breadcrumb } from "./breadcrumb";
import { Footer } from "./footer";

export interface ContainerProps extends ComponentProps<"article"> {
  full?: boolean;
  fullClassName?: string;
  showBreadcrumb?: boolean;
  showFooter?: boolean;
}

export function ArticleContainer({
  children,
  full = false,
  fullClassName,
  showBreadcrumb = true,
  showFooter = true,
  ...props
}: ContainerProps) {
  return (
    <article
      id="nd-page"
      data-full={full}
      {...props}
      className={cn(
        "flex flex-col w-full max-w-[900px] mx-auto [grid-area:main] px-4 py-6 gap-4 md:px-6 md:pt-8 xl:px-8 xl:pt-14",
        full && cn("max-w-6xl", fullClassName),
        props.className,
      )}
    >
      {showBreadcrumb && <Breadcrumb />}
      {children}
      {showFooter && <Footer />}
    </article>
  );
}
