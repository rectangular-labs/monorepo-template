"use client";

import { CaretDown, Text } from "@rectangular-labs/ui/components/icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@rectangular-labs/ui/core/collapsible";
import { CircularProgress } from "@rectangular-labs/ui/core/progress";
import { cn } from "@rectangular-labs/ui/utils";
import { I18nLabel, useI18n } from "fumadocs-ui/contexts/i18n";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { useTreePath } from "../../../components/content-tree/content-tree-context";
import * as Base from "../../../components/toc";
import * as TocClerk from "../../../components/toc/clerk";
import * as TocDefault from "../../../components/toc/default";

export type TOCProviderProps = Base.TOCProviderProps;
export const { TOCProvider } = Base;

export type TOCProps = {
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
} & (
  | {
      style?: "normal";
      list?: TocDefault.TOCItemsProps | undefined;
    }
  | {
      style: "clerk";
      list?: TocClerk.TOCItemsProps | undefined;
    }
);

export function TOC({ className, header, footer, style = "normal", list }: TOCProps) {
  const items = Base.useTOCItems();
  const { TOCItems, TOCEmpty, TOCItem } = style === "clerk" ? TocClerk : TocDefault;

  return (
    <aside
      data-slot="toc"
      className={cn(
        "sticky top-(--banner-height) hidden h-[calc(var(--layout-height)-var(--banner-height))] w-(--toc-width) shrink-0 flex-col px-6 py-12 text-sm [grid-area:toc] xl:flex",
        className,
      )}
    >
      {header}
      <h3 id="toc-title" className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
        <Text className="size-4" />
        <I18nLabel label="toc" />
      </h3>
      <Base.TOCScrollArea>
        <TOCItems {...list}>
          {items.length === 0 && <TOCEmpty />}
          {items.map((item) => (
            <TOCItem key={item.url} item={item} />
          ))}
        </TOCItems>
      </Base.TOCScrollArea>
      {footer}
    </aside>
  );
}

export function TOCPopover({ className, header, footer, style = "normal", list }: TOCProps) {
  const items = Base.useTOCItems();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { TOCItems, TOCItem, TOCEmpty } = style === "clerk" ? TocClerk : TocDefault;

  const onClickOutside = useEffectEvent((event: Event) => {
    if (!open || !(event.target instanceof HTMLElement)) return;

    if (ref.current && !ref.current.contains(event.target)) setOpen(false);
  });

  const onClickItem = () => {
    setOpen(false);
  };

  useEffect(() => {
    window.addEventListener("click", onClickOutside);

    return () => {
      window.removeEventListener("click", onClickOutside);
    };
  }, []);

  return (
    <Collapsible
      ref={ref}
      open={open}
      onOpenChange={setOpen}
      data-slot="toc-popover"
      className={cn(
        "group/toc-popover sticky top-[calc(var(--banner-height)+var(--mobile-header-height))] z-10 h-(--toc-popover-height) min-w-0 [grid-area:toc-popover] xl:hidden",
        "bg-background/60 rounded-lg border-b backdrop-blur transition-[colors,opacity]",
        className,
      )}
    >
      <header className="group-data-open/toc-popover:bg-popover group-data-open/toc-popover:text-popover-foreground group-data-open/toc-popover:shadow-lg">
        <PageTOCPopoverTrigger />
        <PageTOCPopoverContent>
          {header}
          <Base.TOCScrollArea>
            <TOCItems {...list}>
              {items.length === 0 && <TOCEmpty />}
              {items.map((item) => (
                <TOCItem key={item.url} item={item} onClick={onClickItem} />
              ))}
            </TOCItems>
          </Base.TOCScrollArea>
          {footer}
        </PageTOCPopoverContent>
      </header>
    </Collapsible>
  );
}

function PageTOCPopoverTrigger({ className, ...props }: ComponentProps<"button">) {
  const { text } = useI18n();
  const items = Base.useItems();
  const selectedIdx = items.findIndex((item) => item.active);
  const path = useTreePath().at(-1);
  const hasSelectedItem = selectedIdx !== -1;

  return (
    <CollapsibleTrigger
      className={cn(
        "group/toc-popover-trigger text-muted-foreground flex h-9 w-full items-center gap-2.5 px-3 text-start text-sm focus-visible:outline-none [&_svg]:size-4",
        className,
      )}
      data-toc-popover-trigger=""
      {...props}
    >
      <CircularProgress
        value={(items.findLastIndex((item) => item.active) + 1) / Math.max(1, items.length)}
        max={1}
        className="group-data-panel-open/toc-popover-trigger:text-primary shrink-0"
      />
      <span className="grid min-w-0 flex-1 *:col-start-1 *:row-start-1 *:my-auto">
        <span
          className={cn(
            "group-data-panel-open/toc-popover-trigger:text-foreground truncate transition-[opacity,translate,color]",
            hasSelectedItem &&
              "group-not-data-panel-open/toc-popover-trigger:pointer-events-none group-not-data-panel-open/toc-popover-trigger:-translate-y-full group-not-data-panel-open/toc-popover-trigger:opacity-0",
          )}
        >
          {path?.name ?? text.toc}
        </span>
        <span
          className={cn(
            "truncate transition-[opacity,translate]",
            !hasSelectedItem && "pointer-events-none translate-y-full opacity-0",
            hasSelectedItem &&
              "group-data-panel-open/toc-popover-trigger:pointer-events-none group-data-panel-open/toc-popover-trigger:translate-y-full group-data-panel-open/toc-popover-trigger:opacity-0",
          )}
        >
          {items[selectedIdx]?.original.title}
        </span>
      </span>
      <CaretDown className="shrink-0 transition-transform group-data-panel-open/toc-popover-trigger:rotate-180" />
    </CollapsibleTrigger>
  );
}

function PageTOCPopoverContent(props: ComponentProps<"div">) {
  return (
    <CollapsibleContent
      data-toc-popover-content=""
      {...props}
      className={cn("flex max-h-[50vh] flex-col px-3", props.className)}
    >
      {props.children}
    </CollapsibleContent>
  );
}
