"use client";

import { ThemeSwitch } from "@rectangular-labs/ui/components/theme";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@rectangular-labs/ui/core/sidebar";
import { cn } from "@rectangular-labs/ui/utils";
import type { TOCItemType } from "fumadocs-core/toc";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { motion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { useMemo } from "react";
import {
  ContentTreeProvider,
  useTreeContext,
  type ContentTreeProviderProps,
} from "../../components/content-tree/content-tree";
import { Link, LinkIcon } from "../../components/links";
import { SearchTrigger } from "../../components/search-trigger";
import type * as TocClerk from "../../components/toc/clerk";
import type * as TocDefault from "../../components/toc/default";
import { getLayoutTabs, type NavOptions } from "../shared";
import { Sidebar, type SidebarProps } from "./components/sidebar";
import { TabDropdown } from "./components/tab-dropdown";
import { TOC as FluxTOC, TOCProvider, type TOCProviderProps } from "./components/toc";

interface LayoutContainerProps extends ContentTreeProviderProps {
  containerProps?: ComponentProps<"div">;
}

export function LayoutContainer({
  children,
  containerProps,
  defaultOpenLevel = 0,
  prefetch = true,
  tree,
}: LayoutContainerProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <ContentTreeProvider tree={tree} defaultOpenLevel={defaultOpenLevel} prefetch={prefetch}>
        <div
          id="nd-flux-layout"
          {...containerProps}
          className={cn(
            "flex flex-col items-center pb-24 overflow-x-clip mx-auto",
            containerProps?.className,
          )}
        >
          {children}
        </div>
      </ContentTreeProvider>
    </SidebarProvider>
  );
}

interface NavigationPanelProps extends Omit<ComponentProps<typeof motion.div>, "children"> {
  footerLinks?: LinkIcon[];
  hideTabs?: boolean;
  nav?: NavOptions;
  sidebar?: SidebarProps | false;
}

export function NavigationPanel({
  className,
  footerLinks = [],
  hideTabs,
  nav = {},
  sidebar,
  ...props
}: NavigationPanelProps) {
  const { open: searchOpen } = useSearchContext();
  const { open: sidebarOpen } = useSidebar();
  const { full } = useTreeContext();
  const tabs = useMemo(() => {
    if (hideTabs) return [];
    return getLayoutTabs(full);
  }, [full, hideTabs]);
  const panelOpen = searchOpen || sidebarOpen;

  return (
    <>
      {sidebar !== false && <Sidebar {...sidebar} />}
      <motion.div
        {...props}
        className={cn(
          "fixed left-1/2 w-[calc(100%-var(--removed-body-scroll-bar-size,0px))] translate-x-[calc(-50%-var(--removed-body-scroll-bar-size,0px)/2)] bottom-0 z-40 bg-popover text-popover-foreground border-t shadow-lg sm:bottom-6 sm:rounded-2xl sm:border sm:max-w-[380px]",
          className,
        )}
        animate={
          props.animate ?? {
            scale: panelOpen ? 0.9 : 1,
            translateY: panelOpen ? 20 : 0,
            opacity: panelOpen ? 0.8 : 1,
          }
        }
      >
        <div className="flex items-center ps-2.5 p-1 gap-2 min-h-11">
          {nav.title ? (
            <Link className="inline-flex items-center gap-2.5 text-sm font-semibold" href={nav.url}>
              {nav.title}
            </Link>
          ) : null}
          <div id="flux-layout-slot" className="flex-1" />
        </div>

        <div className="flex gap-1.5 overflow-x-auto overflow-y-hidden p-2 sm:p-1">
          <div className="flex min-w-0 flex-1 flex-row items-center gap-2">
            {tabs.length > 0 && <TabDropdown className="flex-1" tabs={tabs} />}
          </div>

          <div className="flex items-center text-muted-foreground border-x px-0.5 empty:hidden">
            {footerLinks.map((item) => (
              <LinkIcon key={item.href} item={item} />
            ))}
          </div>

          <div className="flex flex-row items-center text-muted-foreground empty:hidden">
            <SearchTrigger hideIfDisabled />
            <SidebarTrigger className="overflow-hidden" />
            <ThemeSwitch className="p-1 h-full ms-1 rounded-xl bg-muted *:rounded-lg" />
          </div>
        </div>
      </motion.div>
    </>
  );
}

interface TOCProps {
  options?: TOCOptions;
  toc?: TOCItemType[];
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

export function TOC({ options = {}, toc = [] }: TOCProps) {
  const { single = false, ...tocProps } = options;

  return (
    <TOCProvider single={single} toc={toc}>
      <FluxTOC {...tocProps} />
    </TOCProvider>
  );
}
