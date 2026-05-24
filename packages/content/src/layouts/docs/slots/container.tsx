"use client";
import { cn } from "@rectangular-labs/ui/utils";
import { useEffect, useState, type ComponentProps } from "react";
import { useSidebar } from "./sidebar";

export function Container(props: ComponentProps<"div">) {
  const { collapsed } = useSidebar();
  const [previousCollapsed, setPreviousCollapsed] = useState(collapsed);
  const isCollapseChanged = previousCollapsed !== collapsed;

  // will only set data attribute for an instant
  useEffect(() => {
    if (isCollapseChanged) setPreviousCollapsed(collapsed);
  }, [collapsed, isCollapseChanged]);

  return (
    <div
      id="nd-docs-layout"
      data-sidebar-collapsed={collapsed}
      data-column-changed={isCollapseChanged}
      {...props}
      style={
        {
          gridTemplate: `"sidebar sidebar header toc toc"
"sidebar sidebar toc-popover toc toc"
"sidebar sidebar main toc toc" 1fr / minmax(min-content, 1fr) var(--sidebar-col) minmax(0, calc(var(--layout-width,97rem) - var(--sidebar-width) - var(--toc-width))) var(--toc-width) minmax(min-content, 1fr)`,
          "--docs-row-1": "var(--banner-height, 0px)",
          "--docs-row-2": "calc(var(--docs-row-1) + var(--header-height))",
          "--docs-row-3": "calc(var(--docs-row-2) + var(--toc-popover-height))",
          "--sidebar-col": collapsed ? "0px" : "var(--sidebar-width)",
          ...props.style,
        } as object
      }
      className={cn(
        "grid overflow-x-clip min-h-(--docs-height) [--docs-height:100dvh] [--header-height:0px] [--toc-popover-height:0px] [--sidebar-width:0px] [--toc-width:0px] data-[column-changed=true]:transition-[grid-template-columns]",
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}
