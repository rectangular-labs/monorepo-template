"use client";

import { SidebarProvider, SidebarTrigger } from "@rectangular-labs/ui/core/sidebar";
import { cn } from "@rectangular-labs/ui/utils";
import type * as PageTree from "fumadocs-core/page-tree";
import type { TOCItemType } from "fumadocs-core/toc";
import type { ComponentProps, ReactNode } from "react";
import {
  ContentTreeProvider,
  type ContentTreeProviderProps,
} from "../../components/content-tree/content-tree";
import { Link } from "../../components/links";
import { SearchTrigger } from "../../components/search-trigger";
import type * as TocClerk from "../../components/toc/clerk";
import type * as TocDefault from "../../components/toc/default";
import { NavOptions } from "../shared";
import { Container } from "./components/container";
import { Sidebar } from "./components/sidebar";
import {
  TOC as DesktopTOC,
  TOCPopover,
  TOCProvider,
  type TOCProviderProps,
} from "./components/toc";

export { Sidebar };

export interface LayoutContainerProps extends Omit<ContentTreeProviderProps, "children" | "tree"> {
  children?: ReactNode;
  containerProps?: ComponentProps<typeof Container>;
  tree: PageTree.Root;
}

export function LayoutContainer({
  children,
  containerProps,
  defaultOpenLevel = 0,
  prefetch = true,
  tree,
}: LayoutContainerProps) {
  return (
    <SidebarProvider defaultOpen className="contents">
      <ContentTreeProvider tree={tree} defaultOpenLevel={defaultOpenLevel} prefetch={prefetch}>
        <Container {...containerProps}>{children}</Container>
      </ContentTreeProvider>
    </SidebarProvider>
  );
}

interface MobileHeaderProps extends ComponentProps<"header"> {
  nav?: NavOptions;
}

export function MobileHeader({ nav, children, ...props }: MobileHeaderProps) {
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
      <SidebarTrigger className={"p-2"} />
    </header>
  );
}

type TOCOptions = Pick<TOCProviderProps, "single"> & {
  footer?: ReactNode;
  header?: ReactNode;
} & (
    | {
        list?: TocDefault.TOCItemsProps;
        style?: "normal";
      }
    | {
        list?: TocClerk.TOCItemsProps;
        style: "clerk";
      }
  );

interface TOCProps {
  options?: TOCOptions;
  toc?: TOCItemType[];
}

export function TOC({ options = {}, toc = [] }: TOCProps) {
  const { single = false, ...tocProps } = options;

  return (
    <TOCProvider single={single} toc={toc}>
      <TOCPopover {...tocProps} />
      <DesktopTOC {...tocProps} />
    </TOCProvider>
  );
}
