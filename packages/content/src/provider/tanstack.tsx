"use client";

import { TanstackProvider } from "fumadocs-core/framework/tanstack";
import { SearchProvider, type SearchProviderProps } from "fumadocs-ui/contexts/search";
import { lazy, type ReactNode } from "react";

const DefaultSearchDialog = lazy(() => import("fumadocs-ui/components/dialog/search-default"));

export interface RootProviderProps {
  children?: ReactNode;

  search?: Partial<Omit<SearchProviderProps, "children" | "SearchDialog">> & {
    SearchDialog?: SearchProviderProps["SearchDialog"];
    enabled?: boolean;
  };
}

export function RootProvider({ children, search }: RootProviderProps) {
  let body = children;

  if (search?.enabled !== false) {
    const { enabled: _enabled, SearchDialog = DefaultSearchDialog, ...searchProps } = search ?? {};

    body = (
      <SearchProvider SearchDialog={SearchDialog} {...searchProps}>
        {body}
      </SearchProvider>
    );
  }

  return <TanstackProvider>{body}</TanstackProvider>;
}
