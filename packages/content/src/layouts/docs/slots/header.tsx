"use client";

import { Sidebar } from "@rectangular-labs/ui/components/icons";
import { buttonVariants } from "@rectangular-labs/ui/core/button";
import { cn } from "@rectangular-labs/ui/utils";
import type { ComponentProps } from "react";
import { Link } from "../../../components/links";
import { SearchTrigger } from "../../../components/search-trigger";
import { NavOptions } from "../../shared";
import { SidebarTrigger } from "./sidebar";

export interface HeaderProps extends ComponentProps<"header"> {
  nav?: NavOptions;
}

export function Header({ nav, children, ...props }: HeaderProps) {
  return (
    <header
      id="nd-subnav"
      {...props}
      className={cn(
        "[grid-area:header] sticky top-(--docs-row-1) z-30 flex items-center ps-4 pe-2.5 border-b transition-colors backdrop-blur-sm h-(--header-height) md:hidden max-md:layout:[--header-height:--spacing(14)]",
        props.className,
      )}
    >
      {nav?.title ? (
        <Link className="inline-flex items-center gap-2.5 font-semibold" href={nav.url}>
          {nav.title}
        </Link>
      ) : null}
      <div className="flex-1">{children}</div>
      <SearchTrigger hideIfDisabled className="p-2" />
      <SidebarTrigger
        className={buttonVariants({
          variant: "ghost",
          size: "icon-sm",
          className: "p-2",
        })}
      >
        <Sidebar />
      </SidebarTrigger>
    </header>
  );
}
