import { ArrowUp, Buildings, Check, GitHubIcon } from "@rectangular-labs/ui/components/icons";
import { InteractiveGridPattern } from "@rectangular-labs/ui/background/interactive-grid-pattern";
import { Section } from "@rectangular-labs/ui/components/section";
import { Button } from "@rectangular-labs/ui/core/button";
import { clientEnv } from "~/lib/env";

const proofPoints = [
  "TanStack Start app scaffold",
  "Auth, API, and UI packages wired into one repo",
  "Cloudflare preview and production deployments included",
];

export function Hero() {
  const { VITE_APP_URL } = clientEnv();

  return (
    <Section className="relative overflow-hidden pt-12 text-left md:pt-20">
      <InteractiveGridPattern
        className="absolute inset-x-0 top-10 -z-10 opacity-50"
        height={28}
        interactive={false}
        squares={[72, 24]}
        width={28}
      />

      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
            <ArrowUp className="size-4" />
            Vite Plus monorepo template for shipping apps, not demos
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            The Vite Plus monorepo template we wanted before wiring the same stack by hand again.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
            This template gives you a serious starting point: a Vite Plus monorepo, TanStack Start,
            shared UI, auth, API boundaries, and Cloudflare deployment setup already in place. It is
            opinionated because blank repos do not ship products.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button render={<a href={VITE_APP_URL} />} size="lg">
              Open Demo App
            </Button>
            <Button
              render={
                <a
                  href="https://github.com/rectangular-labs/monorepo-template"
                  rel="noreferrer"
                  target="_blank"
                />
              }
              size="lg"
              variant="outline"
            >
              <GitHubIcon className="size-4" />
              View Repository
            </Button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {proofPoints.map((item) => (
              <div className="rounded-xl border bg-card/80 p-4 backdrop-blur" key={item}>
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 text-primary" />
                  <p className="text-sm text-foreground">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border bg-card/85 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-sm font-medium text-foreground">What is in the box</p>
              <p className="text-sm text-muted-foreground">
                The parts teams usually stitch together late.
              </p>
            </div>
            <Buildings className="size-5 text-primary" />
          </div>

          <div className="space-y-4 pt-5">
            <div className="rounded-2xl bg-muted/60 p-4">
              <p className="text-sm font-medium">App foundation</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Routing, shared packages, workspace tasks, typed envs, and baseline deployment
                setup.
              </p>
            </div>
            <div className="rounded-2xl bg-muted/60 p-4">
              <p className="text-sm font-medium">Real product concerns</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Auth flows, API surface, UI package, and a demo app that shows the pieces working
                together.
              </p>
            </div>
            <div className="rounded-2xl bg-muted/60 p-4">
              <p className="text-sm font-medium">Honest tradeoff</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This is not minimal. It is meant for teams who would rather start from a coherent
                stack.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
