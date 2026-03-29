"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { CircleIcon } from "@phosphor-icons/react";
import * as React from "react";

import { cn } from "@rectangular-labs/ui/utils";

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props<string>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({ className, ...props }: Radio.Root.Props<string>) {
  return (
    <Radio.Root
      data-slot="radio-group-item"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-full border border-input transition-colors outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary",
        className,
      )}
      {...props}
    >
      <Radio.Indicator
        data-slot="radio-group-indicator"
        className="grid place-content-center text-primary"
      >
        <CircleIcon className="size-2.5 fill-current" weight="fill" />
      </Radio.Indicator>
    </Radio.Root>
  );
}

type RadioGroupOption = {
  description?: React.ReactNode;
  disabled?: boolean;
  label: React.ReactNode;
  value: string;
};

export { RadioGroup, RadioGroupItem, type RadioGroupOption };
