import { cva } from "class-variance-authority";
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

const itemVariants = cva("size-6.5 p-1.5 text-muted-foreground", {
  variants: {
    active: {
      true: "bg-accent text-accent-foreground",
      false: "text-muted-foreground",
    },
  },
});

export interface ThemeSwitchProps extends React.ComponentProps<"div"> {
  mode?: "light-dark" | "light-dark-system";
}

export function ThemeSwitch({ className, mode = "light-dark", ...props }: ThemeSwitchProps) {
  const { setTheme, theme } = useTheme();

  // if (mode === "light-dark") {
  //   return (
  //     <button
  //       className={container}
  //       onClick={() => (theme === "dark" ? setTheme("light") : setTheme("dark"))}
  //     >
  //       <span className="sr-only">Toggle theme</span>
  //       {[
  //   ["light", Icons.Sun] as const,
  //   ["dark", Icons.Moon] as const,
  //   ["system", Icons.Monitor] as const,
  // ].map(([key, Icon]) => {
  //         if (key === "system") return;

  //         return (
  //           <Icon
  //             key={key}
  //             fill="currentColor"
  //             className={cn(itemVariants({ active: theme === key }))}
  //           />
  //         );
  //       })}
  //     </button>
  //   );
  // }

  return (
    <div
      className={cn(
        "inline-flex items-center overflow-hidden rounded-full border p-1 *:rounded-full",
        className,
      )}
      {...props}
    >
      {[
        ["light", Icons.Sun] as const,
        ["dark", Icons.Moon] as const,
        ["system", Icons.Monitor] as const,
      ].map(([key, Icon]) => {
        if (mode === "light-dark" && key === "system") return;

        return (
          <button
            key={key}
            aria-label={key}
            className={itemVariants({ active: theme === key })}
            onClick={() => setTheme(key)}
          >
            <Icon className="size-full" fill="currentColor" />
          </button>
        );
      })}
    </div>
  );
}

export { useTheme } from "next-themes";
