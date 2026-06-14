"use client";

import {
  AnthropicIcon,
  ArrowSquareOut,
  CaretDown,
  Check,
  Copy,
  CursorIcon,
  GitHub1,
  OpenAIIcon,
  Pencil,
  Text,
} from "@rectangular-labs/ui/components/icons";
import { Button, buttonVariants } from "@rectangular-labs/ui/core/button";
import { Popover, PopoverContent, PopoverTrigger } from "@rectangular-labs/ui/core/popover";
import { useCopy } from "@rectangular-labs/ui/hooks/use-copy";
import { cn } from "@rectangular-labs/ui/utils";
import { usePathname } from "fumadocs-core/framework";
import { type ComponentProps, useEffect, useMemo, useState } from "react";

const cache = new Map<string, Promise<string>>();

export function EditOnGitHub(props: ComponentProps<"a">) {
  return (
    <a
      target="_blank"
      rel="noreferrer noopener"
      {...props}
      className={cn(
        buttonVariants({
          variant: "secondary",
          size: "sm",
        }),
        "gap-1.5 not-prose",
        props.className,
      )}
    >
      {props.children ?? (
        <>
          <Pencil className="size-3.5" />
          Edit On GitHub
        </>
      )}
    </a>
  );
}

/**
 * Add typography styles
 */
export function DocsBody({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} className={cn("prose flex-1", className)}>
      {children}
    </div>
  );
}

export function DocsDescription({ children, className, ...props }: ComponentProps<"p">) {
  if (children === undefined) return null;

  return (
    <p {...props} className={cn("mb-8 text-lg text-muted-foreground", className)}>
      {children}
    </p>
  );
}

export function DocsTitle({ children, className, ...props }: ComponentProps<"h1">) {
  return (
    <h1 {...props} className={cn("text-[1.75em] font-semibold", className)}>
      {children}
    </h1>
  );
}

export function PageLastUpdate({
  date: value,
  ...props
}: Omit<ComponentProps<"p">, "children"> & { date: Date }) {
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(value.toLocaleDateString());
  }, [value]);

  return (
    <p {...props} className={cn("text-sm text-muted-foreground", props.className)}>
      Last updated on {date}
    </p>
  );
}

/**
 * see https://fumadocs.dev/docs/integrations/llms#page-actions to customize.
 */
export function MarkdownCopyButton({
  markdownUrl,
  ...props
}: ComponentProps<"button"> & {
  /**
   * A URL to fetch the raw Markdown/MDX content of page
   */
  markdownUrl: string;
}) {
  const [isLoading, setLoading] = useState(false);
  const [checked, onClick] = useCopy(async () => {
    const cached = cache.get(markdownUrl);
    if (cached) return navigator.clipboard.writeText(await cached);

    setLoading(true);

    try {
      const promise = fetch(markdownUrl).then((res) => res.text());
      cache.set(markdownUrl, promise);
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": promise,
        }),
      ]);
    } finally {
      setLoading(false);
    }
  });

  return (
    <Button
      disabled={isLoading}
      onClick={onClick}
      {...props}
      variant="secondary"
      size="sm"
      className={cn("gap-2 [&_svg]:size-3.5 [&_svg]:text-muted-foreground", props.className)}
    >
      {checked ? <Check /> : <Copy />}
      {props.children ?? "Copy Markdown"}
    </Button>
  );
}

/**
 * see https://fumadocs.dev/docs/integrations/llms#page-actions to customize.
 */
export function ViewOptionsPopover({
  markdownUrl,
  githubUrl,
  ...props
}: ComponentProps<typeof PopoverTrigger> & {
  /**
   * A URL to the raw Markdown/MDX content of page
   */
  markdownUrl?: string;

  /**
   * Source file URL on GitHub
   */
  githubUrl?: string;
}) {
  const pathname = usePathname();
  const items = useMemo(() => {
    const pageUrl =
      typeof window === "undefined" ? pathname : new URL(pathname, window.location.origin);
    const q = `Read ${pageUrl}, I want to ask questions about it.`;

    return [
      githubUrl && {
        title: "Open in GitHub",
        href: githubUrl,
        icon: <GitHub1 />,
      },
      markdownUrl && {
        title: "View as Markdown",
        href: markdownUrl,
        icon: <Text />,
      },
      {
        title: "Open in ChatGPT",
        href: `https://chatgpt.com/?${new URLSearchParams({
          hints: "search",
          q,
        })}`,
        icon: <OpenAIIcon />,
      },
      {
        title: "Open in Claude",
        href: `https://claude.ai/new?${new URLSearchParams({
          q,
        })}`,
        icon: <AnthropicIcon />,
      },
      {
        title: "Open in Cursor",
        icon: <CursorIcon />,
        href: `https://cursor.com/link/prompt?${new URLSearchParams({
          text: q,
        })}`,
      },
    ].filter((v) => !!v);
  }, [githubUrl, markdownUrl, pathname]);

  return (
    <Popover>
      <PopoverTrigger
        {...props}
        className={(state) =>
          cn(
            buttonVariants({
              variant: "secondary",
              size: "sm",
            }),
            "gap-2 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
            typeof props.className === "function" ? props.className(state) : props.className,
          )
        }
      >
        {props.children ?? "Open"}
        <CaretDown className="size-3.5 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            rel="noreferrer noopener"
            target="_blank"
            className="text-sm p-2 rounded-lg inline-flex items-center gap-2 hover:text-accent-foreground hover:bg-accent [&_svg]:size-4"
          >
            {item.icon}
            {item.title}
            <ArrowSquareOut className="text-muted-foreground size-3.5 ms-auto" />
          </a>
        ))}
      </PopoverContent>
    </Popover>
  );
}
