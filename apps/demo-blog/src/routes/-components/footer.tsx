import { Section } from "@rectangular-labs/ui/components/section";
import { clientEnv } from "~/lib/env";

export function Footer() {
  const { VITE_APP_URL } = clientEnv();

  const links = [
    { title: "Open Demo App", href: VITE_APP_URL },
    { title: "GitHub", href: "https://github.com/rectangular-labs/monorepo-template" },
    { title: "Rectangular Labs", href: "https://rectangularlabs.com" },
  ];

  return (
    <div className="border-t">
      <Section as="footer" className="py-12">
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          {links.map((link) => (
            <a
              className="text-muted-foreground transition-colors hover:text-foreground"
              href={link.href}
              key={link.title}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              target={link.href.startsWith("http") ? "_blank" : undefined}
            >
              {link.title}
            </a>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Rectangular Labs. Built to be a strong Vite Plus monorepo
          template, not a vague starter.
        </p>
      </Section>
    </div>
  );
}
