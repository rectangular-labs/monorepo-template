import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rectangular-labs/ui/core/tabs";
import type { MDXComponents } from "mdx/types";
import { HTMLAttributes, TableHTMLAttributes } from "react";
import { Callout } from "./callout";
import { Card, Cards } from "./card";
import { CodeBlock, Pre } from "./codeblock";
import { Heading } from "./heading";

/**
 * global types for MDX.js
 */
declare module "mdx/types.js" {
  // Augment the MDX types to make it understand React.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    type Element = React.JSX.Element;
    type ElementClass = React.JSX.ElementClass;
    type ElementType = React.JSX.ElementType;
    type IntrinsicElements = React.JSX.IntrinsicElements;
  }
}

// function Image(
//   props: ImgHTMLAttributes<HTMLImageElement> & {
//     sizes?: string;
//   },
// ) {
//   return (
//     <FrameworkImage
//       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
//       {...props}
//       className={cn("rounded-lg", props.className)}
//     />
//   );
// }

function Table(props: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative my-6 prose-no-margin overflow-auto">
      <table {...props} />
    </div>
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    CodeBlockTab: Tabs,
    CodeBlockTabs: TabsContent,
    CodeBlockTabsList: TabsList,
    CodeBlockTabsTrigger: TabsTrigger,
    pre: (props: HTMLAttributes<HTMLPreElement>) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    Card,
    Cards,
    // a: Link as FC<AnchorHTMLAttributes<HTMLAnchorElement>>,
    // TODO: check if this is needed
    // img: img,
    h1: (props: HTMLAttributes<HTMLHeadingElement>) => <Heading as="h1" {...props} />,
    h2: (props: HTMLAttributes<HTMLHeadingElement>) => <Heading as="h2" {...props} />,
    h3: (props: HTMLAttributes<HTMLHeadingElement>) => <Heading as="h3" {...props} />,
    h4: (props: HTMLAttributes<HTMLHeadingElement>) => <Heading as="h4" {...props} />,
    h5: (props: HTMLAttributes<HTMLHeadingElement>) => <Heading as="h5" {...props} />,
    h6: (props: HTMLAttributes<HTMLHeadingElement>) => <Heading as="h6" {...props} />,
    table: Table,
    Callout,
    // todo: do we need these?
    // CalloutContainer,
    // CalloutTitle,
    // CalloutDescription,
    ...components,
  } satisfies MDXComponents;
}

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}

// TODO: replace the sidebar and other core UI elements with the shadcn equivalent while keeping the same overall structure
// TODO: Hook everything up via RSC tanstack starter
