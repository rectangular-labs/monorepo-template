import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Hero } from "~/routes/_marketing/-components/hero";

// Lazy-load below-the-fold components to reduce initial JS and TBT
const Products = lazy(() =>
  import("~/routes/_marketing/-components/products").then((m) => ({
    default: m.Products,
  })),
);
const CTA = lazy(() =>
  import("~/routes/_marketing/-components/cta").then((m) => ({
    default: m.CTA,
  })),
);

export const Route = createFileRoute("/_marketing/")({ component: App });

function App() {
  return (
    <>
      <Hero />
      {/* <Brands /> */}
      <Suspense fallback={null}>
        <Products />
      </Suspense>
      <Suspense fallback={null}>
        <CTA />
      </Suspense>
    </>
  );
}
