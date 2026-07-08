import { type } from "arktype";
import { defineConfig, defineDocs, DocCollection, MetaCollection } from "fumadocs-mdx/config";
import lastModified from "fumadocs-mdx/plugins/last-modified";

export { default as mdxVitePlugin } from "fumadocs-mdx/vite";

export const docsSchema = type({
  title: "string",
  "description?": "string",
  "icon?": "string",
  "full?": "boolean",
  "_openapi?": "object",
});

export const metaSchema = type({
  "title?": "string",
  "pages?": "string[]",
  "description?": "string",
  "root?": "boolean",
  "defaultOpen?": "boolean",
  "collapsible?": "boolean",
  "icon?": "string",
});

export const buildMdxConfig = (args: {
  type: "content";
  dir: string;
  docs?: Omit<DocCollection<typeof docsSchema>, "dir" | "type">;
  meta?: Omit<MetaCollection<typeof metaSchema>, "dir" | "type">;
}) => {
  return {
    content: defineDocs({
      dir: args.dir,
      docs: {
        ...args.docs,
        schema: args.docs?.schema ?? docsSchema,
      },
      meta: {
        ...args.meta,
        schema: args.meta?.schema ?? metaSchema,
      },
    }),
    default: defineConfig({
      plugins: [lastModified()],
    }),
  };
};
