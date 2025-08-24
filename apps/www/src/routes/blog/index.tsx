import { allPosts, type Post } from "@rectangular-labs/blog";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/" as any)({
  component: BlogIndex,
});

function BlogIndex() {
  const posts = allPosts.sort(
    (a: Post, b: Post) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="space-y-8">
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No blog posts yet.</p>
        </div>
      ) : (
        posts.map((post: Post) => (
          <article
            key={post.slug}
            className="border-b border-border pb-8 last:border-b-0"
          >
            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-semibold text-foreground hover:text-primary transition-colors">
                  <Link to={"/blog/$slug" as any} params={{ slug: post.slug } as any}>
                    {post.title}
                  </Link>
                </h2>
                <p className="text-muted-foreground mt-2">{post.description}</p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))
      )}
    </div>
  );
}