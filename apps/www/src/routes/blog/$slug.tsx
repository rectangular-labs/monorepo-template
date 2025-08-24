import { allPosts, MDXContent, type Post } from "@rectangular-labs/blog";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/$slug" as any)({
  component: BlogPost,
  loader: ({ params }: { params: { slug: string } }) => {
    const post = allPosts.find((p: Post) => p.slug === params.slug);
    if (!post) throw notFound();
    return post;
  },
});

function BlogPost() {
  const post = Route.useLoaderData() as Post;

  return (
    <article className="max-w-none">
      <header className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {post.title}
        </h1>
        <p className="text-xl text-muted-foreground">{post.description}</p>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground border-t border-border pt-4">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long", 
              day: "numeric",
            })}
          </time>
          {post.author && <span>By {post.author}</span>}
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <MDXContent code={post.mdx} />
      </div>
    </article>
  );
}