"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import {
  createContext,
  use,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn, mergeRefs } from "@rectangular-labs/ui/utils";

type TabValue = TabsPrimitive.Tab.Value;
type ChangeDetails = NonNullable<TabsPrimitive.Root.Props["onValueChange"]>;
const listeners = new Map<string, Set<ChangeDetails>>();
const TabsContext = createContext<{ valueToIdMap: Map<TabValue, string> } | null>(null);
function useTabsContext() {
  const ctx = use(TabsContext);
  if (!ctx) throw new Error("You must wrap your component in <Tabs>");
  return ctx;
}

function Tabs({
  ref,
  className,
  orientation = "horizontal",
  groupId,
  persist = false,
  updateAnchor = false,
  defaultValue,
  value: valueProp,
  onValueChange,
  ...props
}: TabsPrimitive.Root.Props & {
  /**
   * Identifier for sharing value across tab groups.
   */
  groupId?: string;

  /**
   * Persist shared tab value in localStorage instead of sessionStorage only.
   */
  persist?: boolean;

  /**
   * If true, updates the URL hash based on the active panel's id.
   */
  updateAnchor?: boolean;
}) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const valueToIdMap = useMemo(() => new Map<TabValue, string>(), []);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : uncontrolledValue;
  const setValue = useEffectEvent<
    (nextValue: TabValue, details?: Parameters<ChangeDetails>[1]) => void
  >((nextValue, details) => {
    if (!controlled) setUncontrolledValue(nextValue);

    onValueChange?.(
      nextValue,
      details ?? {
        reason: "none",
        trigger: undefined,
        activationDirection: "none",
        event: new Event("Override"),
        isCanceled: false,
        isPropagationAllowed: false,
        cancel: () => {},
        allowPropagation: () => {},
      },
    );
  });

  // set initial value based on previously stored value
  useLayoutEffect(() => {
    if (!groupId) return;

    let previous = sessionStorage.getItem(groupId);
    if (persist) previous ??= localStorage.getItem(groupId);
    if (previous) setValue(previous);

    const groupListeners = listeners.get(groupId) ?? new Set();
    groupListeners.add(setValue);
    listeners.set(groupId, groupListeners);
    return () => {
      groupListeners.delete(setValue);
      if (groupListeners.size === 0) listeners.delete(groupId);
    };
  }, [groupId, persist]);

  // listen to hash value change and react to it
  useLayoutEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    for (const [value, id] of valueToIdMap.entries()) {
      if (id === hash) {
        setValue(value);
        tabsRef.current?.scrollIntoView();
        break;
      }
    }
  }, [valueToIdMap]);

  return (
    <TabsPrimitive.Root
      ref={mergeRefs(ref, tabsRef)}
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      value={value}
      onValueChange={(nextValue, details) => {
        if (updateAnchor) {
          const id = valueToIdMap.get(nextValue);
          if (id) window.history.replaceState(null, "", `#${id}`);
        }

        if (groupId) {
          const groupListeners = listeners.get(groupId);

          if (groupListeners) {
            for (const listener of groupListeners) listener(nextValue, details);
          }

          sessionStorage.setItem(groupId, String(nextValue));
          if (persist) localStorage.setItem(groupId, String(nextValue));
        } else {
          setValue(nextValue);
        }
      }}
      {...props}
    >
      <TabsContext value={useMemo(() => ({ valueToIdMap }), [valueToIdMap])}>
        {props.children}
      </TabsContext>
    </TabsPrimitive.Root>
  );
}

const tabsListVariants = cva(
  "group/tabs-list not-prose relative inline-flex w-fit items-center justify-center rounded-none p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  children,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      <TabsIndicator />
      {children}
    </TabsPrimitive.List>
  );
}

function TabsIndicator({ className, ...props }: TabsPrimitive.Indicator.Props) {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      className={cn(
        "absolute rounded-none border border-transparent bg-background transition-all duration-200 ease-out dark:border-input dark:bg-input/30",
        "group-data-horizontal/tabs:left-(--active-tab-left) group-data-horizontal/tabs:top-0.75 group-data-horizontal/tabs:h-[calc(100%-6px)] group-data-horizontal/tabs:w-(--active-tab-width)",
        "group-data-vertical/tabs:left-0.75 group-data-vertical/tabs:top-(--active-tab-top) group-data-vertical/tabs:h-(--active-tab-height) group-data-vertical/tabs:w-[calc(100%-6px)]",
        "group-data-[variant=line]/tabs-list:border-0 group-data-[variant=line]/tabs-list:bg-foreground dark:group-data-[variant=line]/tabs-list:bg-foreground",
        "group-data-horizontal/tabs:group-data-[variant=line]/tabs-list:top-auto group-data-horizontal/tabs:group-data-[variant=line]/tabs-list:bottom-1.25 group-data-horizontal/tabs:group-data-[variant=line]/tabs-list:h-0.5",
        "group-data-vertical/tabs:group-data-[variant=line]/tabs-list:left-auto group-data-vertical/tabs:group-data-[variant=line]/tabs-list:-inset-e-1 group-data-vertical/tabs:group-data-[variant=line]/tabs-list:w-0.5",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-none border border-transparent px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-foreground/60 transition-colors group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:py-[calc(--spacing(1.25))] hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pe-1 has-data-[icon=inline-start]:ps-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "data-active:text-foreground dark:data-active:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  const { valueToIdMap } = useTabsContext();

  if (props.id) {
    valueToIdMap.set(props.value, props.id);
  }

  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(
        "group/tab-content prose-no-margin flex-1 text-xs/relaxed outline-none data-inactive:hidden",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsIndicator, TabsList, tabsListVariants, TabsTrigger };
