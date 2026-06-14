"use client";

import { CaretUpDown, Check } from "@rectangular-labs/ui/components/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@rectangular-labs/ui/core/popover";
import { cn } from "@rectangular-labs/ui/utils";
import { usePathname } from "fumadocs-core/framework";
import { type ComponentProps, type ReactNode, useMemo, useState } from "react";
import { Link } from "../../../components/links";
import { isLayoutTabActive, type LayoutTab } from "../../shared";

export function SidebarTabsDropdown({
  tabs,
  placeholder,
  ...props
}: {
  placeholder?: ReactNode;
  tabs: LayoutTab[];
} & ComponentProps<"button">) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const selected = useMemo(() => {
    return tabs.findLast((item) => isLayoutTabActive(item, pathname));
  }, [tabs, pathname]);

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
            "flex items-center gap-2 rounded-lg border bg-secondary/50 p-2 text-start text-secondary-foreground transition-colors hover:bg-accent data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
            props.className,
          )}
        >
          {item}
          <CaretUpDown className="ms-auto size-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
      )}
      <PopoverContent className="fd-scroll-container flex w-[var(--popup-width)] flex-col gap-1 p-1">
        {tabs.map((item) => {
          const isActive = selected && item.url === selected.url;
          if (!isActive && item.unlisted) return null;

          return (
            <Link
              key={item.url}
              href={item.url}
              onClick={() => setOpen(false)}
              {...item.props}
              className={cn(
                "flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent hover:text-accent-foreground",
                item.props?.className,
              )}
            >
              <div className="size-9 shrink-0 empty:hidden md:mb-auto md:size-5">{item.icon}</div>
              <div>
                <p className="text-sm font-medium leading-none">{item.title}</p>
                <p className="mt-1 text-[0.8125rem] text-muted-foreground empty:hidden">
                  {item.description}
                </p>
              </div>
              <Check
                className={cn("ms-auto size-3.5 shrink-0 text-primary", !isActive && "invisible")}
              />
            </Link>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
