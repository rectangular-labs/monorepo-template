"use client";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { MagnifyingGlass } from "@rectangular-labs/ui/components/icons";
import { Button } from "@rectangular-labs/ui/core/button";
import { cn } from "@rectangular-labs/ui/utils";
import type { ComponentProps } from "react";

export interface SearchTriggerProps extends Omit<ComponentProps<"button">, "color"> {
  hideIfDisabled?: boolean;
}

export function SearchTrigger({ hideIfDisabled, ...props }: SearchTriggerProps) {
  const { setOpenSearch, enabled } = useSearchContext();
  if (hideIfDisabled && !enabled) return null;

  return (
    <Button
      type="button"
      size={"icon-sm"}
      variant={"ghost"}
      data-search=""
      aria-label="Open Search"
      onClick={() => {
        setOpenSearch(true);
      }}
      {...props}
    >
      <MagnifyingGlass />
    </Button>
  );
}

export interface FullSearchTriggerProps extends ComponentProps<"button"> {
  hideIfDisabled?: boolean;
}

export function FullSearchTrigger({ hideIfDisabled, ...props }: FullSearchTriggerProps) {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();
  const { text } = useI18n();
  if (hideIfDisabled && !enabled) return null;

  return (
    <button
      type="button"
      data-search-full=""
      {...props}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border bg-secondary/50 p-1.5 ps-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        props.className,
      )}
      onClick={() => {
        setOpenSearch(true);
      }}
    >
      <MagnifyingGlass className="size-4" />
      {text.search}
      <div className="ms-auto inline-flex gap-0.5">
        {hotKey.map((k, i) => (
          <kbd key={i} className="rounded-md border bg-background px-1.5">
            {k.display}
          </kbd>
        ))}
      </div>
    </button>
  );
}
