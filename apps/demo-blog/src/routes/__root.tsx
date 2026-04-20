import { ThemeProvider } from "@rectangular-labs/ui/components/theme";
import { Toaster } from "@rectangular-labs/ui/core/sonner";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { clientEnv } from "~/lib/env";
import { seo } from "~/lib/seo";
import appCss from "../styles.css?url";
import { Footer } from "./-components/footer";
import { Header } from "./-components/header";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "apple-mobile-web-app-title",
        content: "Vite Plus Monorepo Template",
      },
      {
        name: "application-name",
        content: "Vite Plus Monorepo Template",
      },
      ...seo({
        title: "Vite Plus Monorepo Template for teams shipping real products",
        description:
          "A Vite Plus monorepo template with TanStack Start, auth, API, UI, and deployment wiring already set up.",
      }),
    ],
    links: [
      { rel: "canonical", href: clientEnv().VITE_BLOG_URL },
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "96x96",
        href: "/favicon-96x96.png",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        sizes: "any",
        href: "/favicon.svg",
      },
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider attribute="class" enableSystem>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
        <TanStackRouterDevtools position="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}

// reportWebVitals(typeof window!== 'undefined' ?console.log : undefined);
