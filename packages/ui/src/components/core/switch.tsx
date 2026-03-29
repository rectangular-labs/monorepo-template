"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@rectangular-labs/ui/utils";

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-input bg-input/60 px-0.5 transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="size-4 rounded-full bg-background shadow-xs transition-transform data-checked:translate-x-4"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
