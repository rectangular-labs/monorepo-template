"use client";
import { CaretUpDown, Check, Sidebar as SidebarIcon } from "@rectangular-labs/ui/components/icons";
import type { ThemeSwitchProps } from "@rectangular-labs/ui/components/theme";
import { ThemeSwitch } from "@rectangular-labs/ui/components/theme";
import { buttonVariants } from "@rectangular-labs/ui/core/button";
import { Popover, PopoverContent, PopoverTrigger } from "@rectangular-labs/ui/core/popover";
import { cn } from "@rectangular-labs/ui/utils";
import { cva } from "class-variance-authority";
import { usePathname } from "fumadocs-core/framework";
import { type ComponentProps, type ReactNode, useMemo, useRef, useState } from "react";
import * as Base from "../../../components/docs-sidebar/base";
import { createLinkItemRenderer } from "../../../components/docs-sidebar/link-item";
import {
  createPageTreeRenderer,
  type SidebarPageTreeComponents,
} from "../../../components/docs-sidebar/page-tree";
import { Link } from "../../../components/links";
import {
  FullSearchTrigger,
  type FullSearchTriggerProps,
  SearchTrigger,
} from "../../../components/search-trigger";
import { mergeRefs } from "../../../lib/merge-refs";
import { isLayoutTabActive, type LayoutTab, type LinkItemType, NavOptions } from "../../shared";

const itemVariants = cva(
  "relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-muted-foreground wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        link: "transition-colors hover:bg-accent/50 hover:text-accent-foreground/80 hover:transition-none data-[status=active]:bg-primary/10 data-[status=active]:text-primary data-[status=active]:hover:transition-colors",
        button:
          "transition-colors hover:bg-accent/50 hover:text-accent-foreground/80 hover:transition-none",
      },
      highlight: {
        true: "data-[status=active]:before:content-[''] data-[status=active]:before:bg-primary data-[status=active]:before:absolute data-[status=active]:before:w-px data-[status=active]:before:inset-y-2.5 data-[status=active]:before:inset-s-2.5",
      },
    },
  },
);

export interface SidebarProps extends ComponentProps<"aside"> {
  components?: Partial<SidebarPageTreeComponents>;
  banner?: ReactNode;
  footer?: ReactNode;
  nav?: NavOptions | undefined;
  tabs?: LayoutTab[];
  menuItems?: LinkItemType[];
  themeSwitch?: ThemeSwitchProps | false;
  searchToggle?: FullSearchTriggerProps | false;

  /**
   * Support collapsing the sidebar on desktop mode
   *
   * @defaultValue true
   */
  collapsible?: boolean;
}

export type SidebarProviderProps = Base.SidebarProviderProps;

export const { useSidebar } = Base;

export function SidebarProvider(props: SidebarProviderProps) {
  return <Base.SidebarProvider {...props} />;
}

export function Sidebar({
  footer,
  banner,
  collapsible = true,
  components,
  menuItems = [],
  nav,
  searchToggle,
  themeSwitch,
  tabs = [],
  ...rest
}: SidebarProps) {
  const iconLinks = menuItems.filter((item) => item.type === "icon");
  const viewport = (
    <Base.SidebarViewport>
      <div className="flex flex-col gap-0.5">
        {menuItems
          .filter((v) => v.type !== "icon")
          .map((item, i, list) => (
            <SidebarLinkItem key={i} item={item} className={cn(i === list.length - 1 && "mb-4")} />
          ))}
        <SidebarPageTree {...components} />
      </div>
    </Base.SidebarViewport>
  );

  return (
    <>
      <SidebarContent {...rest}>
        <div className="flex flex-col gap-3 p-4 pb-2">
          <div className="flex">
            {nav?.title ? (
              <Link
                className="inline-flex text-[0.9375rem] items-center gap-2.5 font-medium me-auto"
                href={nav.url}
              >
                {nav.title}
              </Link>
            ) : null}
            {collapsible && (
              <SidebarCollapseTrigger
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                    size: "icon-sm",
                    className: "mb-auto text-muted-foreground",
                  }),
                )}
              >
                <SidebarIcon />
              </SidebarCollapseTrigger>
            )}
          </div>
          {searchToggle && <FullSearchTrigger hideIfDisabled {...searchToggle} />}
          {tabs.length > 0 && <SidebarTabsDropdown tabs={tabs} />}
          {banner}
        </div>
        {viewport}
        {(iconLinks.length > 0 || themeSwitch || footer) && (
          <div className="flex flex-col p-4 pt-2">
            <div className="flex text-muted-foreground items-center border bg-secondary/50 p-0.5 pe-0 rounded-lg empty:hidden">
              {iconLinks.map((item, i) => (
                <Link
                  key={i}
                  className={cn(buttonVariants({ size: "icon-sm", variant: "ghost" }))}
                  aria-label={item.label}
                  href={item.url}
                >
                  {item.icon}
                </Link>
              ))}
              {themeSwitch && (
                <ThemeSwitch
                  {...themeSwitch}
                  className={cn(
                    "px-1 py-0 border-y-0 border-e-0 rounded-none ms-auto *:rounded-md",
                    themeSwitch.className,
                  )}
                />
              )}
            </div>
            {footer}
          </div>
        )}
      </SidebarContent>
      <SidebarDrawer>
        <div className="flex flex-col gap-3 p-4 pb-2">
          <div className="flex text-muted-foreground items-center gap-1.5">
            <div className="flex flex-1">
              {iconLinks.map((item, i) => (
                <Link
                  key={i}
                  className={buttonVariants({
                    size: "icon-sm",
                    variant: "ghost",
                    className: "p-2",
                  })}
                  aria-label={item.label}
                  href={item.url}
                  activeOptions={{
                    exact: item.active === "url",
                  }}
                >
                  {item.icon}
                </Link>
              ))}
            </div>
            {themeSwitch && (
              <ThemeSwitch {...themeSwitch} className={cn("p-0", themeSwitch.className)} />
            )}
            <SidebarTrigger
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "icon-sm",
                  className: "p-2",
                }),
              )}
            >
              <SidebarIcon />
            </SidebarTrigger>
          </div>
          {tabs.length > 0 && <SidebarTabsDropdown tabs={tabs} />}
          {banner}
        </div>
        {viewport}
        <div className="flex flex-col border-t p-4 pt-2 empty:hidden">{footer}</div>
      </SidebarDrawer>
    </>
  );
}

function SidebarFolder(props: ComponentProps<typeof Base.SidebarFolder>) {
  return <Base.SidebarFolder {...props} />;
}

function SidebarCollapseTrigger(props: ComponentProps<typeof Base.SidebarCollapseTrigger>) {
  return <Base.SidebarCollapseTrigger {...props} />;
}

export function SidebarTrigger(props: ComponentProps<"button">) {
  return <Base.SidebarTrigger {...props} />;
}

function SidebarContent({ ref: refProp, className, children, ...props }: ComponentProps<"aside">) {
  const ref = useRef<HTMLElement>(null);

  return (
    <Base.SidebarContent>
      {({ collapsed, hovered, ref: asideRef, ...rest }) => (
        <>
          <div
            data-sidebar-placeholder=""
            className="sticky top-(--docs-row-1) z-20 [grid-area:sidebar] pointer-events-none *:pointer-events-auto h-[calc(var(--docs-height)-var(--docs-row-1))] md:layout:[--sidebar-width:268px] max-md:hidden"
          >
            {collapsed && <div className="absolute inset-s-0 inset-y-0 w-4" {...rest} />}
            <aside
              id="nd-sidebar"
              ref={mergeRefs(ref, refProp, asideRef)}
              data-collapsed={collapsed}
              data-hovered={collapsed && hovered}
              className={cn(
                "absolute flex flex-col w-full inset-s-0 inset-y-0 items-end bg-card text-sm border-e duration-250 *:w-(--sidebar-width)",
                collapsed && [
                  "inset-y-2 rounded-xl transition-transform border w-(--sidebar-width)",
                  hovered
                    ? "shadow-lg translate-x-2 rtl:-translate-x-2"
                    : "-translate-x-(--sidebar-width) rtl:translate-x-full",
                ],
                ref.current &&
                  (ref.current.getAttribute("data-collapsed") === "true") !== collapsed &&
                  "transition-[width,inset-block,translate,background-color]",
                className,
              )}
              {...props}
              {...rest}
            >
              {children}
            </aside>
          </div>
          <div
            data-sidebar-panel=""
            className={cn(
              "fixed flex top-[calc(--spacing(4)+var(--docs-row-3))] inset-s-4 shadow-lg transition-opacity rounded-xl p-0.5 border bg-muted text-muted-foreground z-10",
              (!collapsed || hovered) && "pointer-events-none opacity-0",
            )}
          >
            <Base.SidebarCollapseTrigger
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "icon-sm",
                  className: "rounded-lg",
                }),
              )}
            >
              <SidebarIcon />
            </Base.SidebarCollapseTrigger>
            <SearchTrigger className="rounded-lg" hideIfDisabled />
          </div>
        </>
      )}
    </Base.SidebarContent>
  );
}

function SidebarDrawer({
  children,
  className,
  ...props
}: ComponentProps<typeof Base.SidebarDrawerContent>) {
  return (
    <>
      <Base.SidebarDrawerOverlay className="fixed z-40 inset-0 backdrop-blur-xs data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
      <Base.SidebarDrawerContent
        className={cn(
          "fixed text-[0.9375rem] flex flex-col shadow-lg border-s inset-e-0 inset-y-0 w-[85%] max-w-[380px] z-40 bg-background data-[state=open]:animate-sidebar-in data-[state=closed]:animate-sidebar-out",
          className,
        )}
        {...props}
      >
        {children}
      </Base.SidebarDrawerContent>
    </>
  );
}

function SidebarSeparator({ className, style, children, ...props }: ComponentProps<"p">) {
  const depth = Base.useFolderDepth();

  return (
    <Base.SidebarSeparator
      className={cn(
        "inline-flex items-center gap-2 mb-1 px-2 mt-6 empty:mb-0 [&_svg]:size-4 [&_svg]:shrink-0",
        depth === 0 && "first:mt-0",
        className,
      )}
      style={{
        paddingInlineStart: getItemOffset(depth),
        ...style,
      }}
      {...props}
    >
      {children}
    </Base.SidebarSeparator>
  );
}

function SidebarItem({
  className,
  style,
  children,
  ...props
}: ComponentProps<typeof Base.SidebarItem>) {
  const depth = Base.useFolderDepth();

  return (
    <Base.SidebarItem
      className={cn(itemVariants({ variant: "link", highlight: depth >= 1 }), className)}
      style={{
        paddingInlineStart: getItemOffset(depth),
        ...style,
      }}
      {...props}
    >
      {children}
    </Base.SidebarItem>
  );
}

function SidebarFolderTrigger({
  className,
  style,
  ...props
}: ComponentProps<typeof Base.SidebarFolderTrigger>) {
  const { depth, collapsible } = Base.useFolder()!;

  return (
    <Base.SidebarFolderTrigger
      className={(state) =>
        cn(
          itemVariants({ variant: collapsible ? "button" : null }),
          "w-full",
          typeof className === "function" ? className(state) : className,
        )
      }
      style={{
        paddingInlineStart: getItemOffset(depth - 1),
        ...style,
      }}
      {...props}
    >
      {props.children}
    </Base.SidebarFolderTrigger>
  );
}

function SidebarFolderLink({
  className,
  style,
  ...props
}: ComponentProps<typeof Base.SidebarFolderLink>) {
  const depth = Base.useFolderDepth();

  return (
    <Base.SidebarFolderLink
      className={cn(itemVariants({ variant: "link", highlight: depth > 1 }), "w-full", className)}
      style={{
        paddingInlineStart: getItemOffset(depth - 1),
        ...style,
      }}
      {...props}
    >
      {props.children}
    </Base.SidebarFolderLink>
  );
}

function SidebarFolderContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Base.SidebarFolderContent>) {
  const depth = Base.useFolderDepth();

  return (
    <Base.SidebarFolderContent
      className={(state) =>
        cn(
          "relative flex flex-col gap-0.5 pt-0.5",
          depth === 1 &&
            "before:content-[''] before:absolute before:w-px before:inset-y-1 before:bg-border before:inset-s-2.5",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      {children}
    </Base.SidebarFolderContent>
  );
}

function SidebarTabsDropdown({
  tabs,
  placeholder,
  ...props
}: {
  placeholder?: ReactNode;
  tabs: LayoutTab[];
} & ComponentProps<"button">) {
  const [open, setOpen] = useState(false);
  const { closeOnRedirect } = useSidebar();
  const pathname = usePathname();

  const selected = useMemo(() => {
    return tabs.findLast((item) => isLayoutTabActive(item, pathname));
  }, [tabs, pathname]);

  const onClick = () => {
    closeOnRedirect.current = false;
    setOpen(false);
  };

  const item = selected ? (
    <>
      <div className="size-9 shrink-0 empty:hidden md:size-5">{selected.icon}</div>
      <div>
        <p className="text-sm font-medium">{selected.title}</p>
        <p className="text-sm text-muted-foreground empty:hidden md:hidden">
          {selected.description}
        </p>
      </div>
    </>
  ) : (
    placeholder
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {item && (
        <PopoverTrigger
          {...props}
          className={cn(
            "flex items-center gap-2 rounded-lg p-2 border bg-secondary/50 text-start text-secondary-foreground transition-colors hover:bg-accent data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
            props.className,
          )}
        >
          {item}
          <CaretUpDown className="shrink-0 ms-auto size-4 text-muted-foreground" />
        </PopoverTrigger>
      )}
      <PopoverContent className="flex flex-col gap-1 w-[var(--popup-width)] p-1 fd-scroll-container">
        {tabs.map((item) => {
          const isActive = selected && item.url === selected.url;
          if (!isActive && item.unlisted) return;

          return (
            <Link
              key={item.url}
              href={item.url}
              onClick={onClick}
              {...item.props}
              className={cn(
                "flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent hover:text-accent-foreground",
                item.props?.className,
              )}
            >
              <div className="shrink-0 size-9 md:mb-auto md:size-5 empty:hidden">{item.icon}</div>
              <div>
                <p className="text-sm font-medium leading-none">{item.title}</p>
                <p className="text-[0.8125rem] text-muted-foreground mt-1 empty:hidden">
                  {item.description}
                </p>
              </div>

              <Check
                className={cn("shrink-0 ms-auto size-3.5 text-primary", !isActive && "invisible")}
              />
            </Link>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

function getItemOffset(depth: number) {
  return `calc(${2 + 3 * depth} * var(--spacing))`;
}

const SidebarPageTree = createPageTreeRenderer({
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
  SidebarSeparator,
});

const SidebarLinkItem = createLinkItemRenderer({
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
});
