import { backend } from "@/lib/backend";
import * as Icons from "@rectangular-labs/ui/components/icon";
import { ThemeToggle } from "@rectangular-labs/ui/components/theme-provider";
import { Button } from "@rectangular-labs/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@rectangular-labs/ui/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
  loader: async () => {
    const response = await backend.api.$get();
    return response.json();
  },
});

function App() {
  const data = Route.useLoaderData();
  return (
    <div className="min-h-screen">
      <ThemeToggle className="absolute top-4 right-4" />

      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16">
        <h1 className="font-bold text-4xl tracking-tight">{data.message}</h1>

        <p className="mt-4 text-lg ">
          A modern, full-stack development template
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>React + TanStack</CardTitle>
              <CardDescription className="">
                Build modern, type-safe UIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="">
                A powerful combination for building interactive web applications
                with type safety and excellent developer experience.
              </p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button variant="outline" className="w-full" asChild>
                <a
                  href="https://tanstack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Icons.TanStack className="h-5 w-5" />
                  <span>Learn TanStack</span>
                </a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Hono Backend</CardTitle>
              <CardDescription className="">Edge-ready backend</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="">
                Ultra-fast, lightweight web framework with excellent TypeScript
                support and Cloudflare compatibility.
              </p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button variant="outline" className="w-full" asChild>
                <a
                  href="https://hono.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Icons.Hono className="h-5 w-5" />
                  <span>Explore Hono</span>
                </a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Monorepo Architecture</CardTitle>
              <CardDescription className="">
                Scalable project organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="">
                Share code between projects, maintain consistency, and scale
                your development with a modern monorepo setup.
              </p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button variant="outline" className="w-full" asChild>
                <a
                  href="https://github.com/pnpm/pnpm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Icons.Pnpm className="h-5 w-5" />
                  <span>Learn More</span>
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-16 flex flex-col items-center">
          <Button className="gap-2" variant="default" asChild>
            <a
              href="https://github.com/ElasticBottle/monorepo-template"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icons.GitHub className="h-5 w-5" />
              <span>View on GitHub</span>
            </a>
          </Button>

          <p className="mt-8 text-sm">
            Edit{" "}
            <code className="rounded px-1 py-0.5 ">src/routes/index.tsx</code>{" "}
            to customize this page
          </p>
        </div>
      </div>
    </div>
  );
}
