import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Hero } from "~/routes/-components/hero";

const Products = lazy(() =>
  import("~/routes/-components/products").then((m) => ({
    default: m.Products,
  })),
);
const CTA = lazy(() =>
  import("~/routes/-components/cta").then((m) => ({
    default: m.CTA,
  })),
);

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <>
      <Hero />
      <Suspense fallback={null}>
        <Products />
      </Suspense>
      <Suspense fallback={null}>
        <CTA />
      </Suspense>
    </>
  );
}
