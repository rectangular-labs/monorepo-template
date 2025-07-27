import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type * as React from "react";
import * as Icons from "../components/icon";
import { cn } from "../utils/cn";
import { Button } from "./ui/button";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      className={cn("relative", className)}
      onClick={() => (theme === "dark" ? setTheme("light") : setTheme("dark"))}
      size="icon"
      variant="outline"
    >
      <Icons.Sun className="dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0" />
      <Icons.Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export { useTheme } from "next-themes";
