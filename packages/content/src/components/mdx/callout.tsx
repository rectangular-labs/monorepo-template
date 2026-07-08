import {
  CheckCircle,
  Info,
  Lightbulb,
  Warning,
  XCircle,
} from "@rectangular-labs/ui/components/icons";
import { Alert, AlertDescription, AlertTitle } from "@rectangular-labs/ui/core/alert";
import { cn } from "@rectangular-labs/ui/utils";
import type { ComponentProps, ReactNode } from "react";

export type CalloutType = "info" | "warn" | "error" | "success" | "warning" | "idea";

const iconClass = "size-4";

export function Callout({
  children,
  title,
  ...props
}: { title?: ReactNode } & Omit<CalloutContainerProps, "title">) {
  return (
    <CalloutContainer {...props}>
      {title && <CalloutTitle>{title}</CalloutTitle>}
      <CalloutDescription>{children}</CalloutDescription>
    </CalloutContainer>
  );
}

export interface CalloutContainerProps extends ComponentProps<"div"> {
  /**
   * @defaultValue info
   */
  type?: CalloutType;

  /**
   * Force an icon
   */
  icon?: ReactNode;
}

function resolveAlias(type: CalloutType) {
  if (type === "warn") return "warning";
  if ((type as unknown) === "tip") return "info";
  return type;
}

export function CalloutContainer({
  type: inputType = "info",
  icon,
  children,
  className,
  style,
  ...props
}: CalloutContainerProps) {
  const type = resolveAlias(inputType);

  return (
    <Alert
      data-callout-type={type}
      variant={type === "error" ? "destructive" : "default"}
      className={cn(
        "my-4",
        type === "warning" && "border-primary/30 text-primary",
        type === "success" && "border-primary/30 text-primary",
        type === "idea" && "border-primary/30 text-primary",
        className,
      )}
      style={style}
      {...props}
    >
      {icon ??
        {
          info: <Info className={iconClass} />,
          warning: <Warning className={iconClass} />,
          error: <XCircle className={iconClass} />,
          success: <CheckCircle className={iconClass} />,
          idea: <Lightbulb className={iconClass} />,
        }[type]}
      {children}
    </Alert>
  );
}

export function CalloutTitle({ children, className, ...props }: ComponentProps<typeof AlertTitle>) {
  return (
    <AlertTitle className={cn("my-0!", className)} {...props}>
      {children}
    </AlertTitle>
  );
}

export function CalloutDescription({
  children,
  className,
  ...props
}: ComponentProps<typeof AlertDescription>) {
  return (
    <AlertDescription className={cn("prose-no-margin empty:hidden", className)} {...props}>
      {children}
    </AlertDescription>
  );
}
