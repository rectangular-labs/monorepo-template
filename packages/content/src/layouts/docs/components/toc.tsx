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
  createContext,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
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

export function TOCProvider(props: TOCProviderProps) {
  return <Base.TOCProvider {...props} />;
}

export type TOCProps = {
  container?: ComponentProps<"div">;
  /**
   * Custom content in TOC container, before the main TOC
   */
  header?: ReactNode;

  /**
   * Custom content in TOC container, after the main TOC
   */
  footer?: ReactNode;
} & (
  | {
      style?: "normal";
      list?: TocDefault.TOCItemsProps;
    }
  | {
      style: "clerk";
      list?: TocClerk.TOCItemsProps;
    }
);

export function TOC({ container, header, footer, style = "normal", list }: TOCProps) {
  const items = Base.useTOCItems();
  const { TOCItems, TOCEmpty, TOCItem } = style === "clerk" ? TocClerk : TocDefault;

  return (
    <div
      id="nd-toc"
      {...container}
      className={cn(
        "sticky top-(--docs-row-1) h-[calc(var(--docs-height)-var(--docs-row-1))] flex flex-col [grid-area:toc] w-(--toc-width) pt-12 pe-4 pb-2 xl:layout:[--toc-width:268px] max-xl:hidden",
        container?.className,
      )}
    >
      {header}
      <h3 id="toc-title" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
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
    </div>
  );
}

const TocPopoverContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export type TOCPopoverProps = {
  container?: ComponentProps<"div">;
  trigger?: ComponentProps<"button">;
  content?: ComponentProps<"div">;

  /**
   * Custom content in TOC container, before the main TOC
   */
  header?: ReactNode;

  /**
   * Custom content in TOC container, after the main TOC
   */
  footer?: ReactNode;
} & (
  | {
      style?: "normal";
      list?: TocDefault.TOCItemsProps;
    }
  | {
      style: "clerk";
      list?: TocClerk.TOCItemsProps;
    }
);

export function TOCPopover({
  container,
  trigger,
  content,
  header,
  footer,
  style = "normal",
  list,
}: TOCPopoverProps) {
  const items = Base.useTOCItems();
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const { TOCItems, TOCItem, TOCEmpty } = style === "clerk" ? TocClerk : TocDefault;

  const onClickOutside = useEffectEvent((e: Event) => {
    if (!open || !(e.target instanceof HTMLElement)) return;

    if (ref.current && !ref.current.contains(e.target)) setOpen(false);
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
    <TocPopoverContext
      value={useMemo(
        () => ({
          open,
          setOpen,
        }),
        [setOpen, open],
      )}
    >
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        data-toc-popover=""
        {...container}
        className={cn(
          "sticky top-(--docs-row-2) z-10 [grid-area:toc-popover] h-(--toc-popover-height) xl:hidden max-xl:layout:[--toc-popover-height:--spacing(10)]",
          container?.className,
        )}
      >
        <header
          ref={ref}
          className={cn("border-b backdrop-blur-sm transition-colors", open && "bg-background/80")}
        >
          <PageTOCPopoverTrigger {...trigger} />
          <PageTOCPopoverContent {...content}>
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
    </TocPopoverContext>
  );
}

function PageTOCPopoverTrigger({ className, ...props }: ComponentProps<"button">) {
  const { text } = useI18n();
  const { open } = use(TocPopoverContext)!;
  const items = Base.useItems();
  const selectedIdx = items.findIndex((item) => item.active);
  const path = useTreePath().at(-1);
  const showItem = selectedIdx !== -1 && !open;

  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full h-10 items-center text-sm text-muted-foreground gap-2.5 px-4 py-2.5 text-start focus-visible:outline-none [&_svg]:size-4 md:px-6",
        className,
      )}
      data-toc-popover-trigger=""
      {...props}
    >
      <CircularProgress
        value={(items.findLastIndex((item) => item.active) + 1) / Math.max(1, items.length)}
        max={1}
        className={cn("shrink-0", open && "text-primary")}
      />
      <span className="grid flex-1 *:my-auto *:row-start-1 *:col-start-1">
        <span
          className={cn(
            "truncate transition-[opacity,translate,color]",
            open && "text-foreground",
            showItem && "opacity-0 -translate-y-full pointer-events-none",
          )}
        >
          {path?.name ?? text.toc}
        </span>
        <span
          className={cn(
            "truncate transition-[opacity,translate]",
            !showItem && "opacity-0 translate-y-full pointer-events-none",
          )}
        >
          {items[selectedIdx]?.original.title}
        </span>
      </span>
      <CaretDown className={cn("shrink-0 transition-transform mx-0.5", open && "rotate-180")} />
    </CollapsibleTrigger>
  );
}

function PageTOCPopoverContent(props: ComponentProps<"div">) {
  return (
    <CollapsibleContent data-toc-popover-content="" {...props}>
      <div className="flex flex-col px-4 max-h-[50vh] md:px-6">{props.children}</div>
    </CollapsibleContent>
  );
}
