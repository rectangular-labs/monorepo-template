"use client";

import { SidebarProvider } from "@rectangular-labs/ui/core/sidebar";
import { cn } from "@rectangular-labs/ui/utils";
import type { TOCItemType } from "fumadocs-core/toc";
import type { ComponentProps, CSSProperties } from "react";
import {
  ContentTreeProvider,
  type ContentTreeProviderProps,
} from "../../components/content-tree/content-tree";
import { Sidebar } from "./components/sidebar";
import {
  TOC as DesktopTOC,
  TOCPopover,
  TOCProps,
  TOCProvider,
  type TOCProviderProps,
} from "./components/toc";

export { Sidebar };

export interface LayoutContainerProps extends ContentTreeProviderProps {
  className?: string;
  toc?: TOCItemType[];
  tocOptions?: Pick<TOCProviderProps, "single">;
}

export function LayoutContainer({
  children,
  defaultOpenLevel = 0,
  prefetch = true,
  toc = [],
  tocOptions,
  tree,
  className,
}: LayoutContainerProps) {
  return (
    <ContentTreeProvider tree={tree} defaultOpenLevel={defaultOpenLevel} prefetch={prefetch}>
      <TOCProvider toc={toc} {...tocOptions}>
        <SidebarProvider defaultOpen>
          <LayoutGrid className={className}>{children}</LayoutGrid>
        </SidebarProvider>
      </TOCProvider>
    </ContentTreeProvider>
  );
}

/**
 * Layout variable contract:
 *
 * --layout-height is the total layout height and defaults to 100dvh.
 * --banner-height is the sticky offset reserved for an external banner. It
 *   defaults to 0px on this grid and can be overridden by passing a className
 *   or style value to LayoutContainer.
 * --sidebar-width defaults to 0px and becomes 16rem on md+ when a
 *   [data-slot="sidebar"] descendant exists.
 * --toc-width defaults to 0px and becomes 16rem on xl+ when a
 *   [data-slot="toc"] descendant exists.
 * --toc-popover-height defaults to 0px and becomes spacing(10) below xl when a
 *   [data-slot="toc-popover"] descendant exists.
 * --mobile-header-height defaults to 0px and becomes spacing(14) below md when a
 *   [data-slot="mobile-header"] descendant exists.
 *
 * Grid areas:
 *
 * sidebar occupies the first column across all rows.
 * mobile-header occupies the top center row for small screens.
 * toc-popover occupies the second center row below the mobile header.
 * main occupies the remaining center content row.
 * toc occupies the right column across all rows.
 *
 * There is no dedicated banner grid area. Banners should override
 * --banner-height on this grid so sticky children can offset themselves from
 * the top edge.
 */
function LayoutGrid({ children, className, style, ...props }: ComponentProps<"div">) {
  return (
    <div
      id="nd-shadcn-layout"
      {...props}
      style={
        {
          gridTemplate: `"sidebar mobile-header toc"
"sidebar toc-popover toc"
"sidebar main toc" 1fr / var(--sidebar-width) minmax(0, 1fr) var(--toc-width)`,
          ...style,
        } as CSSProperties
      }
      className={cn(
        "grid min-h-(--layout-height) w-full overflow-x-clip",
        "[--layout-height:100dvh]",
        "[--banner-height:0px]",
        "[--sidebar-width:0px] md:has-data-[slot=sidebar]:[--sidebar-width:16rem]",
        "[--toc-width:0px] xl:has-data-[slot=toc]:[--toc-width:16rem]",
        "[--toc-popover-height:0px] max-xl:has-data-[slot=toc-popover]:[--toc-popover-height:--spacing(10)]",
        "[--mobile-header-height:0px] max-md:has-data-[slot=mobile-header]:[--mobile-header-height:--spacing(14)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TOC(props: TOCProps) {
  return (
    <>
      <TOCPopover {...props} />
      <DesktopTOC {...props} />
    </>
  );
}
