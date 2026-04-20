import { Section } from "@rectangular-labs/ui/components/section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@rectangular-labs/ui/core/card";

const featureCards = [
  {
    title: "Monorepo without the ceremony",
    description:
      "Apps, packages, and tooling live in one place with shared TypeScript config, workspace scripts, and package boundaries that make sense.",
  },
  {
    title: "Vite Plus where it matters",
    description:
      "Use Vite Plus for orchestration and packaging instead of gluing together a pile of ad hoc scripts once the repo gets busy.",
  },
  {
    title: "Private app already modeled",
    description:
      "The included demo app shows login, protected routes, and API wiring so teams can start from a product shape instead of a marketing shell.",
  },
  {
    title: "Cloudflare deploy flow included",
    description:
      "Preview environments and production routes are already wired for app-level deployments instead of being left as a future platform task.",
  },
  {
    title: "UI package, not copy-paste UI",
    description:
      "Shared components live in a workspace package, so you can grow a design system instead of duplicating component code across apps.",
  },
  {
    title: "Enough structure to rank and ship",
    description:
      "The template is opinionated because repositories that say less up front usually cost more once product work starts.",
  },
];

const stack = [
  "Vite Plus",
  "TanStack Start",
  "Cloudflare Workers",
  "Workspace UI package",
  "Typed environment validation",
  "Auth and API package boundaries",
];

export function Products() {
  return (
    <>
      <Section className="content-vis-auto" id="features">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Built for teams searching for a Vite Plus monorepo template that can actually carry a
            product.
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            The goal is simple: remove the week where you reinvent app structure, deployment, shared
            packages, and private-app plumbing before any feature work starts.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((card) => (
            <Card className="border-border/80 bg-card/80" key={card.title}>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="content-vis-auto" id="stack">
        <div className="grid gap-8 rounded-3xl border bg-card/70 p-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div>
            <p className="text-sm font-medium tracking-[0.24em] text-muted-foreground uppercase">
              Stack
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight">
              A Vite Plus template with enough opinion to stay coherent.
            </h3>
            <p className="mt-4 text-muted-foreground">
              We are not claiming this is the only valid stack. We are claiming it is a strong one
              if you want a modern Vite Plus monorepo template with a real app shape on day one.
            </p>
          </div>

          <Card className="border-border/80 bg-background/70">
            <CardHeader>
              <CardTitle>Included foundations</CardTitle>
              <CardDescription>
                The major pieces already connected instead of left as TODOs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 text-sm text-muted-foreground">
                {stack.map((item) => (
                  <li className="rounded-xl bg-muted/60 px-4 py-3" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
}
