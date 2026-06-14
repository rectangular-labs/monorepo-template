"use client";

import { Dialog, DialogContent, DialogTitle } from "@rectangular-labs/ui/core/dialog";
import {
  SidebarContent as CoreSidebarContent,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@rectangular-labs/ui/core/sidebar";
import { cn } from "@rectangular-labs/ui/utils";
import { type ComponentProps } from "react";
import {
  ContentTree,
  type ContentTreeComponents,
} from "../../../components/content-tree/content-tree";

export interface SidebarProps extends ComponentProps<"div"> {
  components?: Partial<ContentTreeComponents> | undefined;
  pinChildren?: boolean;
}

export function Sidebar({
  children,
  className,
  components,
  pinChildren = true,
  ...props
}: SidebarProps) {
  return (
    <DialogSidebar className={className} {...props}>
      <SidebarHeader className="empty:hidden">{pinChildren ? children : null}</SidebarHeader>
      <CoreSidebarContent>
        <ContentTree components={components}>{pinChildren ? null : children}</ContentTree>
      </CoreSidebarContent>
    </DialogSidebar>
  );
}

export function DialogSidebar({ className, children, ...props }: ComponentProps<"div">) {
  const { open, setOpen } = useSidebar();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="inset-s-0 top-0 bottom-26 block min-h-0 translate-x-0 translate-y-0 overflow-y-auto no-scrollbar border-0 bg-transparent p-0 py-16 pr-(--removed-body-scroll-bar-size,0) text-popover-foreground ring-0 shadow-none mask-[linear-gradient(to_bottom,transparent,white_--spacing(14),white_calc(100%---spacing(14)),transparent)] sm:max-w-none lg:text-sm rtl:translate-x-0"
      >
        <DialogTitle className="sr-only">Navigation</DialogTitle>
        <SidebarContent
          id="nd-sidebar"
          className={cn("mx-auto sm:max-w-100", className)}
          {...props}
        >
          {children}
        </SidebarContent>
      </DialogContent>
    </Dialog>
  );
}
