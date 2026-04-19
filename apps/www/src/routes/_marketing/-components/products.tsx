import { Section } from "@rectangular-labs/ui/components/section";
import { Button } from "@rectangular-labs/ui/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@rectangular-labs/ui/core/card";
import { Link } from "@tanstack/react-router";

export function Products() {
  return (
    <Section className="content-vis-auto">
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Try our products</h2>
      <p className="mt-2 text-muted-foreground">Built for production, fully open source.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>Lightweight Result type for TypeScript</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ergonomic, explicit success/failure handling without exceptions.
            </p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button render={<Link to="/" />} size="sm">
              Docs
            </Button>
            <Button
              render={
                <a
                  href="https://www.npmjs.com/package/@rectangular-labs/result"
                  rel="noreferrer"
                  target="_blank"
                />
              }
              size="sm"
              variant="outline"
            >
              NPM
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emails</CardTitle>
            <CardDescription>Composable email kit + drivers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ship beautiful, reliable emails with provider-agnostic drivers.
            </p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button render={<Link to="/" />} size="sm">
              Docs
            </Button>
            <Button
              render={
                <a
                  href="https://www.npmjs.com/package/@rectangular-labs/emails"
                  rel="noreferrer"
                  target="_blank"
                />
              }
              size="sm"
              variant="outline"
            >
              NPM
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Starter Template</CardTitle>
            <CardDescription>Production-ready TypeScript monorepo</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              TanStack Start, ORPC, Drizzle/Postgres, Better Auth, Payments, Emails, and Pre built
              UI.
            </p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button
              render={
                <a
                  href="https://github.com/rectangular-labs/monorepo-template"
                  rel="noreferrer"
                  target="_blank"
                />
              }
              size="sm"
              variant="default"
            >
              View Repo
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Section>
  );
}
