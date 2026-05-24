"use client";

import type * as PageTree from "fumadocs-core/page-tree";
import { TreeContextProvider } from "fumadocs-ui/contexts/tree";
import { type HTMLAttributes, useMemo } from "react";
import {
  type BaseLayoutProps,
  getLayoutTabs,
  type GetLayoutTabsOptions,
  type LayoutTab,
  useLinkItems,
} from "../shared";
import { Container } from "./slots/container";
import { Header } from "./slots/header";
import {
  Sidebar,
  type SidebarProps,
  SidebarProvider,
  type SidebarProviderProps,
} from "./slots/sidebar";

export interface DocsLayoutProps extends BaseLayoutProps {
  tree: PageTree.Root;
  sidebar?: SidebarOptions;
  tabs?: LayoutTab[] | GetLayoutTabsOptions | false;
  containerProps?: HTMLAttributes<HTMLDivElement>;
}

interface SidebarOptions extends SidebarProps, SidebarProviderProps {
  enabled?: boolean;
}

export function DocsLayout({ tree, tabs: layoutTabs, children, ...props }: DocsLayoutProps) {
  const tabs = useMemo(() => {
    if (Array.isArray(layoutTabs)) {
      return layoutTabs;
    }
    if (typeof layoutTabs === "object") {
      return getLayoutTabs(tree, layoutTabs);
    }
    if (layoutTabs !== false) {
      return getLayoutTabs(tree);
    }
    return [];
  }, [tree, layoutTabs]);

  const {
    nav,
    searchToggle: { enabled: searchToggleEnabled = true, ...searchToggle } = {},
    themeSwitch: { enabled: themeSwitchEnabled = true, ...themeSwitch } = {},
    sidebar: { enabled: sidebarEnabled = true, defaultOpenLevel, prefetch, ...sidebarProps } = {},
    containerProps,
  } = props;
  const linkItems = useLinkItems(props);
  const resolvedSearchToggle = searchToggleEnabled ? searchToggle : false;
  const resolvedThemeSwitch = themeSwitchEnabled ? themeSwitch : false;

  return (
    <TreeContextProvider tree={tree}>
      <SidebarProvider defaultOpenLevel={defaultOpenLevel ?? 0} prefetch={prefetch ?? true}>
        <Container {...containerProps}>
          {nav && <Header nav={nav} />}
          {sidebarEnabled && (
            <Sidebar
              {...sidebarProps}
              menuItems={linkItems.menuItems}
              nav={nav}
              searchToggle={(resolvedSearchToggle && resolvedSearchToggle.full) ?? false}
              tabs={tabs}
              themeSwitch={resolvedThemeSwitch}
            />
          )}

          {children}
        </Container>
      </SidebarProvider>
    </TreeContextProvider>
  );
}
