import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/blog" as any)({
  component: BlogLayout,
});

function BlogLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Blog
          </h1>
          <p className="mt-2 text-muted-foreground">
            Thoughts, tutorials, and insights from our team
          </p>
        </header>
        <Outlet />
      </div>
    </div>
  );
}