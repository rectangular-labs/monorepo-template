import { Logo, Menu, X } from "@rectangular-labs/ui/components/icons";
import { ThemeToggle } from "@rectangular-labs/ui/components/theme";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const menuItems = [
  { name: "Docs", href: "/docs" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
];
function HeaderItems({ items }: { items: { name: string; href: string }[] }) {
  return (
    <>
      <div className="lg:pr-4">
        <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
          {items.map((item) => (
            <li key={item.name}>
              {item.href.startsWith("#") ? (
                <a
                  className="block text-muted-foreground duration-150 hover:text-accent-foreground"
                  href={item.href}
                >
                  <span>{item.name}</span>
                </a>
              ) : (
                <Link
                  className="block text-muted-foreground duration-150 hover:text-accent-foreground"
                  to={item.href}
                >
                  <span>{item.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
        <ThemeToggle variant="outline" />
      </div>
    </>
  );
}

export function Header() {
  const [menuState, setMenuState] = useState<boolean>(false);

  return (
    <header>
      <nav
        className="fixed z-20 w-full border-b backdrop-blur md:relative md:backdrop-blur-none lg:h-[70px]"
        data-state={menuState && "active"}
      >
        <div className="m-auto flex h-full max-w-5xl flex-wrap items-center justify-between gap-6 px-4 py-3 md:px-6 lg:gap-0 lg:py-4">
          <div className="flex w-full justify-between lg:w-auto">
            <Link
              aria-label="home"
              className="flex items-center gap-2 text-muted-foreground"
              to="/"
            >
              <Logo /> Rectangular Labs
            </Link>

            <button
              aria-label={menuState === true ? "Close Menu" : "Open Menu"}
              className="relative -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              onClick={() => setMenuState(!menuState)}
              type="button"
            >
              <Menu className="m-auto size-6 duration-200 in-data-[state=active]:scale-0 in-data-[state=active]:rotate-180 in-data-[state=active]:opacity-0" />
              <X className="absolute inset-0 m-auto size-6 scale-0 -rotate-180 opacity-0 duration-200 in-data-[state=active]:scale-100 in-data-[state=active]:rotate-0 in-data-[state=active]:opacity-100" />
            </button>
          </div>
          <AnimatePresence>
            {menuState && (
              <motion.div
                animate={{ opacity: 1, scaleY: 1, y: 0 }}
                className="mb-6 block w-full flex-wrap items-center justify-end space-y-8 rounded-lg border bg-background p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:hidden dark:shadow-none"
                exit={{ opacity: 0, scaleY: 0.98, y: 10 }}
                initial={{ opacity: 0, scaleY: 0.98, y: -10 }}
                transition={{ duration: 0.2, ease: [0, 0, 0.28, 1] }}
              >
                <HeaderItems items={menuItems} />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="m-0 hidden w-fit flex-nowrap items-center justify-end gap-6 rounded-lg border border-transparent bg-transparent p-0 lg:flex">
            <HeaderItems items={menuItems} />
          </div>
        </div>
      </nav>
    </header>
  );
}
