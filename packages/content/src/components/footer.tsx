"use client";

import { CaretLeft, CaretRight } from "@rectangular-labs/ui/components/icons";
import { cn } from "@rectangular-labs/ui/utils";
import { usePathname } from "fumadocs-core/framework";
import Link from "fumadocs-core/link";
import type * as PageTree from "fumadocs-core/page-tree";
import { type ComponentProps, useMemo } from "react";
import { isActive } from "../lib/urls";
import { useTreeContext } from "./content-tree/content-tree-context";

type Item = Pick<PageTree.Item, "name" | "description" | "url">;

export interface FooterProps extends ComponentProps<"div"> {
  /**
   * Items including information for the next and previous page
   */
  items?: {
    previous?: Item;
    next?: Item;
  };
}

const footerCache = new WeakMap<PageTree.Root | PageTree.Folder, PageTree.Item[]>();
/**
 * @returns a list of page tree items (linear), that you can obtain footer items
 */
export function useFooterItems(): PageTree.Item[] {
  const { root } = useTreeContext();
  const cached = footerCache.get(root);
  if (cached) return cached;

  const list: PageTree.Item[] = [];
  function onNode(node: PageTree.Node) {
    if (node.type === "folder") {
      if (node.index) onNode(node.index);
      for (const child of node.children) onNode(child);
    } else if (node.type === "page" && !node.external) {
      list.push(node);
    }
  }

  for (const child of root.children) onNode(child);
  footerCache.set(root, list);
  return list;
}

export function Footer({ items, children, className, ...props }: FooterProps) {
  const footerList = useFooterItems();
  const pathname = usePathname();
  const { previous, next } = useMemo(() => {
    if (items) return items;

    const idx = footerList.findIndex((item) => isActive(item.url, pathname));

    if (idx === -1) return {};
    return {
      previous: footerList[idx - 1],
      next: footerList[idx + 1],
    };
  }, [footerList, items, pathname]);

  return (
    <>
      <div
        className={cn(
          "@container grid gap-4",
          previous && next ? "grid-cols-2" : "grid-cols-1",
          className,
        )}
        {...props}
      >
        {previous && <FooterItem item={previous} index={0} />}
        {next && <FooterItem item={next} index={1} />}
      </div>
      {children}
    </>
  );
}

function FooterItem({ item, index }: { item: Item; index: 0 | 1 }) {
  const Icon = index === 0 ? CaretLeft : CaretRight;

  return (
    <Link
      href={item.url}
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-accent/80 hover:text-accent-foreground @max-lg:col-span-full",
        index === 1 && "text-end",
      )}
    >
      <div
        className={cn(
          "inline-flex items-center gap-1.5 font-medium",
          index === 1 && "flex-row-reverse",
        )}
      >
        <Icon className="-mx-1 size-4 shrink-0 rtl:rotate-180" />
        <p>{item.name}</p>
      </div>
      <p className="text-muted-foreground truncate">
        {item.description ?? (index === 0 ? "Previous Page" : "Next Page")}
      </p>
    </Link>
  );
}
