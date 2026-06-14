"use client";

import { Check, Copy } from "@rectangular-labs/ui/components/icons";
import { Button } from "@rectangular-labs/ui/core/button";
import { useCopy } from "@rectangular-labs/ui/hooks/use-copy";
import { cn } from "@rectangular-labs/ui/utils";
import { type ComponentProps, useState } from "react";

const cache = new Map<string, Promise<string>>();

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
