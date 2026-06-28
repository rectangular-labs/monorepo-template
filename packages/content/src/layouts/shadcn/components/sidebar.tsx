"use client";

import type { ThemeSwitchProps } from "@rectangular-labs/ui/components/theme";
import { ThemeSwitch } from "@rectangular-labs/ui/components/theme";
import {
  Sidebar as CoreSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@rectangular-labs/ui/core/sidebar";
import { cn } from "@rectangular-labs/ui/utils";
import { type ComponentProps } from "react";
import {
  ContentTree,
  type ContentTreeComponents,
} from "../../../components/content-tree/content-tree";
import { Link, LinkIcon } from "../../../components/page-items/links";
import {
  FullSearchTrigger,
  type FullSearchTriggerProps,
} from "../../../components/page-items/search-trigger";
import { type NavOptions } from "../../shared";

interface SidebarProps extends ComponentProps<typeof CoreSidebar> {
  components?: Partial<ContentTreeComponents> | undefined;
  footerLinks?: LinkIcon[] | undefined;
  nav?: NavOptions | undefined;
  pinChildren?: boolean;
  searchToggle?: FullSearchTriggerProps | false | undefined;
  themeSwitch?: ThemeSwitchProps | false | undefined;
}

export function Sidebar({
  children,
  className,
  components,
  footerLinks = [],
  nav,
  pinChildren = true,
  searchToggle,
  themeSwitch,
  ...props
}: SidebarProps) {
  const { isMobile } = useSidebar();
  const headerChildren = pinChildren ? children : null;
  const treeChildren = pinChildren ? null : children;

  return (
    <CoreSidebar
      {...props}
      collapsible={isMobile ? "offcanvas" : "none"}
      side="right"
      className={cn(
        "bg-background text-sidebar-foreground overflow-hidden border-e",
        "sticky top-(--banner-height) h-[calc(var(--layout-height)-var(--banner-height))] [grid-area:sidebar]",
        className,
      )}
    >
      <SidebarHeader>
        <div className="flex min-w-0 items-center gap-2">
          {nav?.title ? (
            <Link
              className="me-auto inline-flex min-w-0 items-center gap-2.5 text-[0.9375rem] font-medium"
              href={nav.url}
            >
              <span className="truncate">{nav.title}</span>
            </Link>
          ) : null}
        </div>
        {searchToggle && <FullSearchTrigger hideIfDisabled {...searchToggle} />}
        {headerChildren}
      </SidebarHeader>
      <SidebarContent>
        <ContentTree components={components}>{treeChildren}</ContentTree>
      </SidebarContent>
      {(footerLinks.length > 0 || themeSwitch) && (
        <SidebarFooter>
          <div className="bg-secondary/50 text-muted-foreground flex items-center rounded-lg border p-0.5 pe-0 empty:hidden">
            {footerLinks.map((item) => (
              <LinkIcon key={item.href} item={item} />
            ))}
            {themeSwitch && (
              <ThemeSwitch
                {...themeSwitch}
                className={cn("ms-auto border-y-0 border-e-0 px-1 py-0", themeSwitch.className)}
              />
            )}
          </div>
        </SidebarFooter>
      )}
    </CoreSidebar>
  );
}
