import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { type } from "arktype";

const postSchema = type({
  title: "string",
  description: "string",
  date: "string",
  "author?": "string",
  "tags?": "string[]",
});

const posts = defineCollection({
  name: "posts",
  directory: "content",
  include: "*.mdx",
  schema: postSchema,
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);
    return {
      ...document,
      mdx,
      slug: document._meta.path.replace(/\.mdx$/, ""),
    };
  },
});

export default defineConfig({
  collections: [posts],
});