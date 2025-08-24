import { MDXContent as BaseMDXContent } from "@content-collections/mdx/react";

interface MDXContentProps {
  code: string;
  components?: Record<string, React.ComponentType>;
}

export function MDXContent({ code, components = {} }: MDXContentProps) {
  return <BaseMDXContent code={code} components={components} />;
}