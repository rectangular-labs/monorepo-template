import { InteractiveGridPattern } from "@rectangular-labs/ui/background/interactive-grid-pattern";
import { Section } from "@rectangular-labs/ui/components/section";
import { Button } from "@rectangular-labs/ui/core/button";
import { Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const InteractiveRectangle = lazy(() =>
  import("./interactive-rectangle").then((m) => ({
    default: m.InteractiveRectangle,
  })),
);

export function Hero() {
  return (
    <Section className="relative text-center">
      <h1 className="text-4xl font-bold tracking-tight text-balance md:text-6xl">
        Bootstrapped, customer-obsessed software ventures
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-balance text-muted-foreground md:text-xl">
        We conceive, build, and operate high-craft products — shipped fast, built to last.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button render={<Link to="/" />} size="lg">
          Read the Docs
        </Button>
        <Button render={<Link to="/" />} size="lg" variant="outline">
          Read Lab Notes
        </Button>
      </div>

      <div
        aria-hidden
        className="relative mt-12 h-80 overflow-hidden rounded-lg border p-4 md:h-96 md:p-6"
      >
        <InteractiveGridPattern height={24} interactive={false} squares={[60, 20]} width={24} />
        <Suspense fallback={null}>
          <InteractiveRectangle />
        </Suspense>
      </div>
    </Section>
  );
}
