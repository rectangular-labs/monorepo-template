"use client";

import { cn } from "@rectangular-labs/ui/utils";
import { type ComponentProps, useEffect, useState } from "react";

export function PageLastUpdate({
  date: value,
  ...props
}: Omit<ComponentProps<"p">, "children"> & { date: Date }) {
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(value.toLocaleDateString());
  }, [value]);

  return (
    <p {...props} className={cn("text-sm text-muted-foreground", props.className)}>
      Last updated on {date}
    </p>
  );
}
