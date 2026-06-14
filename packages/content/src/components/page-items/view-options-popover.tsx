"use client";

import {
  AnthropicIcon,
  ArrowSquareOut,
  CaretDown,
  CursorIcon,
  GitHub1,
  OpenAIIcon,
  Text,
} from "@rectangular-labs/ui/components/icons";
import { buttonVariants } from "@rectangular-labs/ui/core/button";
import { Popover, PopoverContent, PopoverTrigger } from "@rectangular-labs/ui/core/popover";
import { cn } from "@rectangular-labs/ui/utils";
import { usePathname } from "fumadocs-core/framework";
import { type ComponentProps, useMemo } from "react";

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
