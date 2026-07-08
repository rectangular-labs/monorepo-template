import type * as React from "react";

import { cn } from "@rectangular-labs/ui/utils";
import { useSidebar } from "./sidebar";

function SidebarPeekRail({
  className,
  onPointerEnter,
  onPointerLeave,
  ...props
}: React.ComponentProps<"div">) {
  const { setPeekOpen } = useSidebar();

  return (
    <div
      data-sidebar="peek-rail"
      data-slot="sidebar-peek-rail"
      aria-hidden="true"
      className={cn(
        "fixed inset-y-0 z-30 hidden w-4 peer-data-[side=left]:left-0 peer-data-[side=right]:right-0 md:peer-data-[collapsible=offcanvas]:block",
        className,
      )}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (!event.defaultPrevented && event.pointerType !== "touch") {
          setPeekOpen(true);
        }
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        if (
          event.relatedTarget instanceof Element &&
          event.relatedTarget.closest('[data-slot="sidebar-container"]')
        ) {
          return;
        }
        if (!event.defaultPrevented && event.pointerType !== "touch") {
          setPeekOpen(false);
        }
      }}
      {...props}
    />
  );
}

export { SidebarPeekRail };
