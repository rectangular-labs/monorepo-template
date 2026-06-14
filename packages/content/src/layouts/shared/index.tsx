import * as PageTree from "fumadocs-core/page-tree";
import { type ComponentProps, type ReactNode } from "react";
import { isActive, normalize } from "../../lib/urls";

export interface NavOptions {
  title?: ReactNode;
  /**
   * Redirect url of title
   * @defaultValue '/'
   */
  url?: string;
}

export interface LayoutTab {
  /**
   * Redirect URL of the folder, usually the index page
   */
  url: string;
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  unlisted?: boolean | undefined;
  props?: ComponentProps<"a">;

  /**
   * bind to a page tree node.
   */
  $folder?: PageTree.Folder;

  /**
   * Detect from a list of urls (when not bound to page tree).
   */
  urls?: Set<string>;
}

export interface GetLayoutTabsOptions {
  transform?: (option: LayoutTab, node: PageTree.Folder) => LayoutTab | null;
}

const defaultTransform: GetLayoutTabsOptions["transform"] = (option, node) => {
  if (!node.icon) return option;

  return {
    ...option,
    icon: (
      <div className="size-full max-md:rounded-md max-md:border max-md:bg-secondary max-md:p-1.5 [&_svg]:size-full">
        {node.icon}
      </div>
    ),
  };
};

export function getLayoutTabs(
  tree: PageTree.Root,
  { transform = defaultTransform }: GetLayoutTabsOptions = {},
): LayoutTab[] {
  const results: LayoutTab[] = [];

  function next(node: PageTree.Root | PageTree.Folder, unlisted?: boolean) {
    if ("root" in node && node.root) {
      const url = node.index?.url ?? node.children.find((node) => node.type === "page")?.url;

      if (url) {
        const option: LayoutTab = {
          title: node.name,
          icon: node.icon,
          description: node.description,
          url,
          unlisted,
          $folder: node,
        };

        const mapped = transform ? transform(option, node) : option;
        if (mapped) results.push(mapped);
      }
    }

    for (const child of node.children) {
      if (child.type === "folder") next(child, unlisted);
    }
  }

  next(tree);
  if (tree.fallback) next(tree.fallback, true);

  return results;
}

export function isLayoutTabActive(tab: LayoutTab, pathname: string) {
  if (tab.$folder) {
    return (
      PageTree.findPath(
        tab.$folder.children,
        (node) => node.type === "page" && isActive(node.url, pathname),
      ) !== null
    );
  }

  if (tab.urls) {
    return tab.urls.has(normalize(pathname));
  }

  return isActive(tab.url, pathname, true);
}
