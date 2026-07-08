import {
  Card as CoreCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@rectangular-labs/ui/core/card";
import { cn } from "@rectangular-labs/ui/utils";
import Link from "fumadocs-core/link";
import type { HTMLAttributes, ReactNode } from "react";

export function Cards(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn("@container grid grid-cols-2 gap-3", props.className)}>
      {props.children}
    </div>
  );
}

export type CardProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;

  href?: string;
  external?: boolean;
};

export function Card({
  icon,
  title,
  description,
  href,
  external,
  className,
  children,
  ...props
}: CardProps) {
  const titleText = typeof title === "string" ? title : "Open card";

  return (
    <CoreCard
      {...props}
      data-card
      className={cn(
        "relative @max-lg:col-span-full",
        href && "transition-colors hover:bg-muted/70",
        className,
      )}
    >
      {href ? (
        <Link
          aria-label={titleText}
          className="absolute inset-0 z-10"
          href={href}
          {...(external === undefined ? {} : { external })}
        />
      ) : null}
      <div className={cn("relative z-20", href && "pointer-events-none")}>
        <CardHeader>
          {icon ? (
            <div className="not-prose mb-2 w-fit border bg-muted p-1.5 text-muted-foreground [&_svg]:size-4">
              {icon}
            </div>
          ) : null}
          <CardTitle>
            <h3 className="not-prose text-sm font-medium">{title}</h3>
          </CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        {children ? (
          <CardContent className="prose-no-margin text-sm text-muted-foreground empty:hidden">
            {children}
          </CardContent>
        ) : null}
      </div>
    </CoreCard>
  );
}
