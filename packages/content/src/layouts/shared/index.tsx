// @ts-nocheck
import { GitHub2 } from "@rectangular-labs/ui/components/icons";
import { ThemeSwitchProps } from "@rectangular-labs/ui/components/theme";
import type { I18nConfig } from "fumadocs-core/i18n";
import * as PageTree from "fumadocs-core/page-tree";
import { useMemo, type ComponentProps, type ReactNode } from "react";
import type { FullSearchTriggerProps, SearchTriggerProps } from "../../components/search-trigger";
import { isActive, normalize } from "../../lib/urls";

export interface NavOptions {
  title?: ReactNode;
  /**
   * Redirect url of title
   * @defaultValue '/'
   */
  url?: string;
}

export interface BaseLayoutProps {
  /**
   * GitHub url
   */
  githubUrl?: string;
  links?: LinkItemType[];
  /**
   * navigation config
   */
  nav?: NavOptions;
  children?: ReactNode;
  themeSwitch?: ThemeSwitchOptions;
  searchToggle?: SearchToggleOptions;

  /**
   * @deprecated this is now optional for i18n setups, you can still customize language switch from `slots`.
   */
  i18n?: boolean | I18nConfig;
}

interface SearchToggleOptions {
  enabled?: boolean;
  sm?: SearchTriggerProps;
  full?: FullSearchTriggerProps;
}

interface ThemeSwitchOptions extends ThemeSwitchProps {
  enabled?: boolean;
}

export interface LayoutTab {
  /**
   * Redirect URL of the folder, usually the index page
   */
  url: string;
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  unlisted?: boolean;
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

interface Filterable {
  /**
   * Restrict where the item is displayed
   *
   * @defaultValue 'all'
   */
  on?: "menu" | "nav" | "all";
}

interface WithHref {
  url: string;
  /**
   * When the item is marked as active
   *
   * @defaultValue 'url'
   */
  active?: "url" | "nested-url" | "none";
  external?: boolean;
}

export interface MainItemType extends WithHref, Filterable {
  type?: "main";
  icon?: ReactNode;
  text: ReactNode;
  description?: ReactNode;
}

export interface IconItemType extends WithHref, Filterable {
  type: "icon";
  /**
   * `aria-label` of icon button
   */
  label?: string;
  icon: ReactNode;
  text: ReactNode;
  /**
   * @defaultValue true
   */
  secondary?: boolean;
}

export interface ButtonItemType extends WithHref, Filterable {
  type: "button";
  icon?: ReactNode;
  text: ReactNode;
  /**
   * @defaultValue false
   */
  secondary?: boolean;
}

export interface MenuItemType extends Partial<WithHref>, Filterable {
  type: "menu";
  icon?: ReactNode;
  text: ReactNode;

  items: (
    | (MainItemType & {
        /**
         * Options when displayed on navigation menu
         */
        menu?: ComponentProps<"a"> & {
          banner?: ReactNode;
        };
      })
    | CustomItemType
  )[];

  /**
   * @defaultValue false
   */
  secondary?: boolean;
}

export interface CustomItemType extends Filterable {
  type: "custom";
  /**
   * @defaultValue false
   */
  secondary?: boolean;
  children: ReactNode;
}

export type LinkItemType =
  | MainItemType
  | IconItemType
  | ButtonItemType
  | MenuItemType
  | CustomItemType;

/**
 * Get link items with shortcuts
 */
function resolveLinkItems({
  links = [],
  githubUrl,
}: Pick<BaseLayoutProps, "links" | "githubUrl">): LinkItemType[] {
  const result = [...links];

  if (githubUrl)
    result.push({
      type: "icon",
      url: githubUrl,
      text: "Github",
      label: "GitHub",
      icon: <GitHub2 />,
      external: true,
    });

  return result;
}

export function useLinkItems({ githubUrl, links }: Pick<BaseLayoutProps, "links" | "githubUrl">) {
  return useMemo(() => {
    const all = resolveLinkItems({ links, githubUrl });
    const navItems: LinkItemType[] = [];
    const menuItems: LinkItemType[] = [];

    for (const item of all) {
      switch (item.on) {
        case "menu":
          menuItems.push(item);
          break;
        case "nav":
          navItems.push(item);
          break;
        default:
          navItems.push(item);
          menuItems.push(item);
      }
    }

    return { navItems, menuItems, all };
  }, [links, githubUrl]);
}
