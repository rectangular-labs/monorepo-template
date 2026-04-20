import { InteractiveGridPattern } from "@rectangular-labs/ui/background/interactive-grid-pattern";
import { Section } from "@rectangular-labs/ui/components/section";
import { Button } from "@rectangular-labs/ui/core/button";
import { clientEnv } from "~/lib/env";

export function CTA() {
  const { VITE_APP_URL } = clientEnv();

  return (
    <Section className="content-vis-auto" id="proof">
      <div className="relative overflow-hidden rounded-3xl border bg-card/80 p-8 md:p-12">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            See the template behaving like an app, not just describing one.
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            The demo app is where the private side lives: login routes, protected pages, and the
            shared app wiring this template is built around.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button render={<a href={VITE_APP_URL} />} size="lg">
            Launch Demo App
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
            Inspect the Repo
          </Button>
        </div>

        <InteractiveGridPattern
          className="-z-10 opacity-60"
          height={24}
          interactive
          squares={[60, 20]}
          width={24}
        />
      </div>
    </Section>
  );
}
