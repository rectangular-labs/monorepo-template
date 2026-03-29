import { InteractiveGridPattern } from "@rectangular-labs/ui/components/background/interactive-grid-pattern";
import { Button } from "@rectangular-labs/ui/components/core/button";
import { Section } from "@rectangular-labs/ui/components/ui/section";
import { Link } from "@tanstack/react-router";

export function CTA() {
  return (
    <Section className="content-vis-auto">
      <div className="relative overflow-hidden rounded-lg border p-8 text-center md:p-12">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Build in the future</h2>
        <p className="mt-2 text-muted-foreground">
          We are actively building new products. Stay tuned.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button render={<Link to="/" />} size="lg">
            Read the Docs
          </Button>
          <Button render={<Link to="/" />} size="lg" variant="outline">
            Read Lab Notes
          </Button>
        </div>
        <InteractiveGridPattern
          className="-z-10"
          height={24}
          interactive
          squares={[60, 20]}
          width={24}
        />
      </div>
    </Section>
  );
}
