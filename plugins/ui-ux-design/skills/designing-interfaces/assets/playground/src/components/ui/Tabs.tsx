import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";

export const Tabs = ({ className, ...props }: TabsPrimitive.TabsProps) => (
  <TabsPrimitive.Root className={cn("min-w-0", className)} {...props} />
);
export const TabsContent = (props: TabsPrimitive.TabsContentProps) => (
  <TabsPrimitive.Content
    {...props}
    className={cn("pt-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm", props.className)}
  />
);

/** Underline tabs for page sections; segmented for compact view switches. Arrow keys move between tabs. */
export function TabsList({ variant = "underline", className, ...props }: TabsPrimitive.TabsListProps & { variant?: "underline" | "segmented" }) {
  return (
    <TabsPrimitive.List
      className={cn(
        variant === "underline"
          ? "flex gap-1 overflow-x-auto border-b [scrollbar-width:thin]"
          : "inline-flex gap-1 rounded-lg bg-muted p-1",
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ variant = "underline", className, ...props }: TabsPrimitive.TabsTriggerProps & { variant?: "underline" | "segmented" }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors duration-(--duration-fast)",
        "hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50",
        variant === "underline"
          ? "relative -mb-px h-10 rounded-t-md border-b-2 border-transparent px-3 data-[state=active]:border-primary data-[state=active]:text-foreground"
          : "h-8 rounded-md px-3 data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    />
  );
}
