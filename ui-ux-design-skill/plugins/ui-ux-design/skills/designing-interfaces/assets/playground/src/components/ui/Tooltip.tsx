import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => (
  <TooltipPrimitive.Provider delayDuration={500} skipDelayDuration={300}>
    {children}
  </TooltipPrimitive.Provider>
);

/** Short, non-essential text. Opens on hover and focus, closes on Esc. Never the only source of information. */
export function Tooltip({ content, children, side = "top" }: { content: string; children: React.ReactNode; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="anim-tooltip z-(--z-tooltip) max-w-60 rounded-sm bg-foreground px-2 py-1.5 text-xs text-background shadow-md"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
