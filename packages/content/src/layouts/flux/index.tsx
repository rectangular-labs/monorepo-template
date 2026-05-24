"use client";
import { ThemeSwitch } from "@rectangular-labs/ui/components/theme";
import { buttonVariants } from "@rectangular-labs/ui/core/button";
import { cn } from "@rectangular-labs/ui/utils";
import type * as PageTree from "fumadocs-core/page-tree";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { TreeContextProvider } from "fumadocs-ui/contexts/tree";
import { motion } from "motion/react";
import { type ComponentProps, type ReactNode, useMemo } from "react";
import { Link } from "../../components/links";
import { SearchTrigger } from "../../components/search-trigger";
import {
  type BaseLayoutProps,
  getLayoutTabs,
  type GetLayoutTabsOptions,
  type LayoutTab,
  useLinkItems,
} from "../shared";
import { Container } from "./slots/container";
import {
  Sidebar,
  type SidebarProps,
  SidebarProvider,
  type SidebarProviderProps,
  SidebarTrigger,
} from "./slots/sidebar";
import { TabDropdown } from "./slots/tab-dropdown";

export interface DocsLayoutProps extends BaseLayoutProps {
  tree: PageTree.Root;
  sidebar?: SidebarOptions;
  tabs?: LayoutTab[] | GetLayoutTabsOptions | false;
  renderNavigationPanel?: (props: NavigationPanelProps) => ReactNode;

  containerProps?: ComponentProps<"div">;
}

interface SidebarOptions extends SidebarProps, SidebarProviderProps {
  enabled?: boolean;
}

export function DocsLayout(props: DocsLayoutProps) {
  const {
    tree,
    nav = {},
    searchToggle: { enabled: searchToggleEnabled = true, ...searchToggle } = {},
    themeSwitch: { enabled: themeSwitchEnabled = true, ...themeSwitch } = {},
    sidebar: { enabled: sidebarEnabled = true, defaultOpenLevel, prefetch, ...sidebarProps } = {},
    tabs: defaultTabs,
    children,
    containerProps,
    renderNavigationPanel = (props) => <NavigationPanel {...props} />,
  } = props;
  const linkItems = useLinkItems(props);
  const resolvedSearchToggle = searchToggleEnabled ? searchToggle : false;
  const resolvedThemeSwitch = themeSwitchEnabled ? themeSwitch : false;

  const tabs = useMemo(() => {
    if (Array.isArray(defaultTabs)) {
      return defaultTabs;
    }
    if (typeof defaultTabs === "object") {
      return getLayoutTabs(tree, defaultTabs);
    }
    if (defaultTabs !== false) {
      return getLayoutTabs(tree);
    }
    return [];
  }, [tree, defaultTabs]);

  return (
    <TreeContextProvider tree={tree}>
      <SidebarProvider defaultOpenLevel={defaultOpenLevel ?? 0} prefetch={prefetch ?? true}>
        <Container {...containerProps}>
          {sidebarEnabled && <Sidebar {...sidebarProps} menuItems={linkItems.menuItems} />}
          {children}
        </Container>
        {renderNavigationPanel({
          head: nav.title ? (
            <Link className="inline-flex items-center gap-2.5 text-sm font-semibold" href={nav.url}>
              {nav.title}
            </Link>
          ) : null,
          tabDropdown: tabs.length > 0 && <TabDropdown className="flex-1" tabs={tabs} />,
          tool: (
            <>
              {resolvedSearchToggle && (
                <SearchTrigger
                  {...resolvedSearchToggle.sm}
                  hideIfDisabled
                  className={cn("rounded-lg", resolvedSearchToggle.sm?.className)}
                />
              )}
              <SidebarTrigger
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                    size: "icon-sm",
                    className: "overflow-hidden",
                  }),
                )}
              />
              {resolvedThemeSwitch && (
                <ThemeSwitch
                  {...resolvedThemeSwitch}
                  className={cn(
                    "p-1 h-full ms-1 rounded-xl bg-muted *:rounded-lg",
                    resolvedThemeSwitch.className,
                  )}
                />
              )}
            </>
          ),
          link: linkItems.menuItems
            .filter((item) => item.type === "icon")
            .map((item, i) => (
              <Link
                key={i}
                className={cn(buttonVariants({ size: "icon-sm", variant: "ghost" }))}
                aria-label={item.label}
                href={item.url}
                activeOptions={{
                  exact: item.active === "url",
                }}
              >
                {item.icon}
              </Link>
            )),
        })}
      </SidebarProvider>
    </TreeContextProvider>
  );
}

export interface NavigationPanelProps {
  head: ReactNode;
  tabDropdown: ReactNode;
  tool: ReactNode;
  link: ReactNode;
}

export function NavigationPanel({
  head,
  tabDropdown,
  tool,
  link,
  children = (v) => v,
  ...props
}: NavigationPanelProps &
  Omit<ComponentProps<typeof motion.div>, "children"> & {
    /**
     * replace default children
     */
    children?: (defaultChildren: ReactNode) => ReactNode;
  }) {
  const { open } = useSearchContext();
  return (
    <motion.div
      {...props}
      className={cn(
        "fixed left-1/2 w-[calc(100%-var(--removed-body-scroll-bar-size,0px))] translate-x-[calc(-50%-var(--removed-body-scroll-bar-size,0px)/2)] bottom-0 z-40 bg-popover text-popover-foreground border-t shadow-lg sm:bottom-6 sm:rounded-2xl sm:border sm:max-w-[380px]",
        props.className,
      )}
      animate={
        props.animate ?? {
          scale: open ? 0.9 : 1,
          translateY: open ? 20 : 0,
          opacity: open ? 0.8 : 1,
        }
      }
    >
      {children(
        <>
          <div className="flex flex-row items-center ps-2.5 p-1 gap-2 min-h-11">
            {head}
            <div id="flux-layout-slot" className="flex-1" />
          </div>

          <div className="flex flex-row gap-1.5 overflow-x-auto overflow-y-hidden p-2 sm:p-1">
            <div className="flex flex-row items-center gap-2 min-w-0 flex-1">{tabDropdown}</div>

            <div className="flex flex-row items-center text-muted-foreground border-x px-0.5 empty:hidden">
              {link}
            </div>

            <div className="flex flex-row items-center text-muted-foreground empty:hidden">
              {tool}
            </div>
          </div>
        </>,
      )}
    </motion.div>
  );
}
