import { Button } from "@rectangular-labs/ui/components/button";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <header className="fixed w-full border-gray-200 border-b bg-white/80 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <Link href="/" className="font-bold text-xl">
            Logo
          </Link>
          <div className="space-x-6">
            <Link
              href="/"
              className="text-gray-600 transition-colors hover:text-gray-900"
            >
              Home
            </Link>
            <Link
              href="/settings"
              className="text-gray-600 transition-colors hover:text-gray-900"
            >
              Settings
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="max-w-3xl text-center">
          <h1 className="font-bold text-5xl tracking-tight">
            Welcome to Your Site
          </h1>
          <p className="mt-6 text-gray-600 text-xl">
            A clean, minimal landing page built with Next.js and Tailwind CSS.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button className="rounded-md bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800">
              Get Started
            </Button>
            <Button
              variant={"outline"}
              className="rounded-md border border-gray-200 px-6 py-3 transition-colors hover:bg-gray-50"
            >
              Learn More
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
