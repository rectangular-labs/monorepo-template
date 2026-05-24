// @ts-nocheck
"use client";
import type { TOCItemType } from "fumadocs-core/toc";
import { type ComponentProps, type ReactNode } from "react";
import { ArticleContainer } from "../../../components/article-container";
import { Breadcrumb } from "../../../components/breadcrumb";
import { Footer } from "../../../components/footer";
import { TOC, type TOCProps, TOCProvider, type TOCProviderProps } from "./slots/toc";

export interface DocsPageProps extends ComponentProps<"article"> {
  toc?: TOCItemType[];

  /**
   * Extend the page to fill all available space
   *
   * @defaultValue false
   */
  full?: boolean;

  tableOfContent?: TableOfContentOptions;
}

type TableOfContentOptions = Pick<TOCProviderProps, "single"> &
  TOCProps & {
    enabled?: boolean;
    component?: ReactNode;
  };

export function DocsPage({
  tableOfContent: { enabled: tocEnabled, single, ...tocProps } = {},
  full = false,
  toc = [],
  children,
  ...containerProps
}: DocsPageProps) {
  tocEnabled ??= Boolean(toc.length > 0 || tocProps.header || tocProps.footer);

  return (
    <TOCProvider single={single} toc={tocEnabled ? toc : []}>
      {tocEnabled && (tocProps.component ?? <TOC {...tocProps} />)}
      <ArticleContainer full={full} fullClassName="max-w-[1200px]" {...containerProps}>
        <Breadcrumb />
        {children}
        <Footer />
      </ArticleContainer>
    </TOCProvider>
  );
}
export {
  DocsBody,
  DocsDescription,
  DocsTitle,
  EditOnGitHub,
  MarkdownCopyButton,
  PageLastUpdate,
  ViewOptionsPopover,
} from "../../../components/page-items";
