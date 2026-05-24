"use client";
import type { TOCItemType } from "fumadocs-core/toc";
import { type ComponentProps } from "react";
import { ArticleContainer } from "../../../components/article-container";
import { Breadcrumb } from "../../../components/breadcrumb";
import { Footer } from "../../../components/footer";
import {
  TOC,
  TOCPopover,
  type TOCPopoverProps,
  type TOCProps,
  TOCProvider,
  type TOCProviderProps,
} from "./slots/toc";

export interface DocsPageProps extends ComponentProps<"article"> {
  toc?: TOCItemType[];

  /**
   * Extend the page to fill all available space
   *
   * @defaultValue false
   */
  full?: boolean;

  tableOfContent?: TableOfContentOptions;
  tableOfContentPopover?: TableOfContentPopoverOptions;
}

type TableOfContentOptions = Pick<TOCProviderProps, "single"> &
  TOCProps & {
    enabled?: boolean;
  };

type TableOfContentPopoverOptions = TOCPopoverProps & {
  enabled?: boolean;
};

export function DocsPage({
  full = false,
  tableOfContent: { enabled: tocEnabled, single = false, ...tocProps } = {},
  tableOfContentPopover: { enabled: tocPopoverEnabled, ...tocPopoverProps } = {},
  toc = [],
  children,
  ...containerProps
}: DocsPageProps) {
  tocEnabled ??= Boolean(!full && (toc.length > 0 || tocProps.footer || tocProps.header));
  tocPopoverEnabled ??= Boolean(toc.length > 0 || tocPopoverProps.header || tocPopoverProps.footer);

  return (
    <TOCProvider single={single} toc={tocEnabled || tocPopoverEnabled ? toc : []}>
      {tocPopoverEnabled && <TOCPopover {...tocPopoverProps} />}
      <ArticleContainer full={full} {...containerProps}>
        <Breadcrumb />
        {children}
        <Footer />
      </ArticleContainer>
      {tocEnabled && <TOC {...tocProps} />}
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
