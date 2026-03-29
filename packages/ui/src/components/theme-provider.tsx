import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type * as React from "react";
import * as Icons from "../components/icon";
import { cn } from "../utils";
import { Button, ButtonProps } from "./core/button";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function ThemeToggle({ className, ...props }: ButtonProps) {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      className={cn("relative", className)}
      onClick={() => (theme === "dark" ? setTheme("light") : setTheme("dark"))}
      size="icon"
      variant="outline"
      {...props}
    >
      <Icons.Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Icons.Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export { useTheme } from "next-themes";
