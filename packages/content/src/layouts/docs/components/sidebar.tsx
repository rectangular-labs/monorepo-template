"use client";

import type { ThemeSwitchProps } from "@rectangular-labs/ui/components/theme";
import { ThemeSwitch } from "@rectangular-labs/ui/components/theme";
import {
  SidebarContent as CoreSidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@rectangular-labs/ui/core/sidebar";
import { cn, mergeRefs } from "@rectangular-labs/ui/utils";
import { type ComponentProps, type ReactNode, useMemo, useRef, useState } from "react";
import {
  ContentTree,
  type ContentTreeComponents,
  useTreeContext,
} from "../../../components/content-tree/content-tree";
import { Link, LinkIcon } from "../../../components/links";
import {
  FullSearchTrigger,
  type FullSearchTriggerProps,
  SearchTrigger,
} from "../../../components/search-trigger";
import { getLayoutTabs, type NavOptions } from "../../shared";
import { SidebarTabsDropdown } from "./sidebar-tabs-dropdown";

export interface SidebarProps extends Omit<ComponentProps<"aside">, "children" | "className"> {
  components?: Partial<ContentTreeComponents> | undefined;
  children?: ReactNode;
  footerLinks?: LinkIcon[] | undefined;
  nav?: NavOptions | undefined;
  pinChildren?: boolean;
  hideTabs?: boolean;
  themeSwitch?: ThemeSwitchProps | false | undefined;
  searchToggle?: FullSearchTriggerProps | false | undefined;
}

export function Sidebar({
  children,
  components,
  footerLinks = [],
  nav,
  pinChildren = true,
  searchToggle,
  themeSwitch,
  hideTabs,
  ...props
}: SidebarProps) {
  const { full } = useTreeContext();
  const headerChildren = pinChildren ? children : null;
  const treeChildren = pinChildren ? null : children;
  const tree = <ContentTree components={components}>{treeChildren}</ContentTree>;
  const tabs = useMemo(() => {
    if (hideTabs) {
      return [];
    }
    return getLayoutTabs(full);
  }, [full, hideTabs]);

  return (
    <SidebarDesktopShell {...props}>
      <SidebarHeader>
        <div className="flex">
          {nav?.title && (
            <Link
              className="me-auto inline-flex items-center gap-2.5 text-[0.9375rem] font-medium"
              href={nav.url}
            >
              {nav.title}
            </Link>
          )}
          <SidebarTrigger className="mb-auto text-muted-foreground" />
        </div>
        {searchToggle && <FullSearchTrigger hideIfDisabled {...searchToggle} />}
        {tabs.length > 0 && <SidebarTabsDropdown tabs={tabs} />}
        {headerChildren}
      </SidebarHeader>
      <CoreSidebarContent>{tree}</CoreSidebarContent>
      {(footerLinks.length > 0 || themeSwitch) && (
        <SidebarFooter>
          <div className="flex items-center rounded-lg border bg-secondary/50 p-0.5 pe-0 text-muted-foreground empty:hidden">
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
    </SidebarDesktopShell>
  );
}

function SidebarDesktopShell({
  ref: refProp,
  className,
  children,
  ...props
}: ComponentProps<"aside">) {
  const { open } = useSidebar();
  const collapsed = !open;
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const timerRef = useRef(0);

  function shouldIgnoreHover(event: React.PointerEvent) {
    return (
      !collapsed || event.pointerType === "touch" || (ref.current?.getAnimations().length ?? 0) > 0
    );
  }

  return (
    <>
      <div className="pointer-events-none sticky top-(--docs-row-1) z-20 [grid-area:sidebar] h-[calc(var(--docs-height)-var(--docs-row-1))] *:pointer-events-auto md:layout:[--sidebar-width:268px] max-md:hidden">
        {collapsed && (
          <div
            className="absolute inset-y-0 inset-s-0 w-4"
            onPointerEnter={(event) => {
              if (shouldIgnoreHover(event)) return;
              window.clearTimeout(timerRef.current);
              setHovered(true);
            }}
          />
        )}
        <aside
          id="nd-sidebar"
          ref={mergeRefs(ref, refProp)}
          data-collapsed={collapsed}
          data-hovered={collapsed && hovered}
          className={cn(
            "absolute inset-y-0 inset-s-0 flex w-full flex-col items-end border-e bg-card text-sm duration-250 *:w-(--sidebar-width)",
            collapsed && [
              "inset-y-2 w-(--sidebar-width) rounded-xl border transition-transform",
              hovered
                ? "translate-x-2 shadow-lg rtl:-translate-x-2"
                : "-translate-x-(--sidebar-width) rtl:translate-x-full",
            ],
            className,
          )}
          onPointerEnter={(event) => {
            if (shouldIgnoreHover(event)) return;
            window.clearTimeout(timerRef.current);
            setHovered(true);
          }}
          onPointerLeave={(event) => {
            if (shouldIgnoreHover(event)) return;
            window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(
              () => setHovered(false),
              Math.min(event.clientX, document.body.clientWidth - event.clientX) > 100 ? 0 : 500,
            );
          }}
          {...props}
        >
          {children}
        </aside>
      </div>
      <div
        data-sidebar-panel=""
        className={cn(
          "fixed inset-s-4 top-[calc(--spacing(4)+var(--docs-row-3))] z-10 flex rounded-xl border bg-muted p-0.5 text-muted-foreground shadow-lg transition-opacity",
          (!collapsed || hovered) && "pointer-events-none opacity-0",
        )}
      >
        <SidebarTrigger className={"rounded-lg"} />
        <SearchTrigger className="rounded-lg" hideIfDisabled />
      </div>
    </>
  );
}
