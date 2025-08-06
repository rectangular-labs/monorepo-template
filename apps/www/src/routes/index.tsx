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
});

function App() {
  const data = Route.useLoaderData();
  return (
    <div className="min-h-screen">
      <ThemeToggle className="absolute top-4 right-4" />

      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16">
        <h1 className="font-bold text-4xl tracking-tight">{data}</h1>

        <p className="mt-4 text-lg">
          A modern, full-stack development template
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>React + TanStack Start</CardTitle>
              <CardDescription>Build modern, type-safe UIs</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                A powerful combination for building interactive web applications
                with type safety and excellent developer experience.
              </p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button asChild className="w-full" variant="outline">
                <a
                  className="flex items-center justify-center gap-2"
                  href="https://tanstack.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icons.TanStack className="h-5 w-5" />
                  <span>Learn TanStack</span>
                </a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Monorepo Architecture</CardTitle>
              <CardDescription>Scalable project organization</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Share code between projects, maintain consistency, and scale
                your development with a modern monorepo setup.
              </p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button asChild className="w-full" variant="outline">
                <a
                  className="flex items-center justify-center gap-2"
                  href="https://github.com/pnpm/pnpm"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icons.Pnpm className="h-5 w-5" />
                  <span>Learn More</span>
                </a>
              </Button>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Typesafe APIs with oRPC</CardTitle>
              <CardDescription>
                End-to-end typesafe APIs made simple
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                oRPC is a library for building end-to-end typesafe APIs. No code
                generation, no schemas, just TypeScript.
              </p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button asChild className="w-full" variant="outline">
                <a
                  className="flex items-center justify-center gap-2"
                  href="https://orpc.unnoq.com/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span>Learn More</span>
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-16 flex flex-col items-center space-y-6">
          <Button asChild variant="default">
            <a href="/orpc">
              <span>Try ORPC Demo</span>
            </a>
          </Button>

          <Button asChild className="gap-2" variant="secondary">
            <a
              href="https://github.com/ElasticBottle/monorepo-template"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icons.GitHub className="h-5 w-5" />
              <span>View on GitHub</span>
            </a>
          </Button>

          <p className="mt-8 text-sm">
            Edit{" "}
            <code className="rounded px-1 py-0.5">src/routes/index.tsx</code> to
            customize this page
          </p>
        </div>
      </div>
    </div>
  );
}
