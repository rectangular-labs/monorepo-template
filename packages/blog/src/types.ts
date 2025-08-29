export type Post = {
  title: string;
  description: string;
  date: string;
  author?: string;
  tags?: string[];
  slug: string;
  mdx: string;
  _meta: {
    path: string;
    extension: string;
    directory: string;
    fileName: string;
    filePath: string;
  };
};