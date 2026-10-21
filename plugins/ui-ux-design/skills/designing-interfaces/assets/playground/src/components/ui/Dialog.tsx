import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/useMediaQuery";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

interface ContentProps extends DialogPrimitive.DialogContentProps {
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  footer?: React.ReactNode;
  /** Render as a bottom sheet under 640px (default true). */
  sheetOnCompact?: boolean;
}

const widths = { sm: "max-w-[440px]", md: "max-w-[600px]", lg: "max-w-[800px]" };

/**
 * Dialog that becomes a bottom sheet on compact screens.
 * Radix handles focus trap, Esc, inert background, scroll lock and focus return.
 */
export function DialogContent({ title, description, size = "sm", footer, sheetOnCompact = true, className, children, ...props }: ContentProps) {
  const expanded = useMediaQuery("(min-width: 640px)");
  const sheet = sheetOnCompact && !expanded;
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="anim-overlay fixed inset-0 z-(--z-overlay) bg-black/50 dark:bg-black/70" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-(--z-modal) flex flex-col bg-surface-raised text-foreground shadow-xl outline-none",
          sheet
            ? "anim-sheet inset-x-0 bottom-0 max-h-[90dvh] rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
            : cn("anim-dialog left-1/2 top-1/2 max-h-[85dvh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl", widths[size]),
          className
        )}
        {...props}
      >
        {sheet && <div aria-hidden className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-input" />}
        <div className="flex items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="grid gap-1">
            <DialogPrimitive.Title className="text-lg font-semibold leading-7">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="text-sm text-muted-foreground">{description}</DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            aria-label="Close"
            className="-me-2 -mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X className="size-4" aria-hidden />
          </DialogPrimitive.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t px-4 py-3 sm:flex-row sm:justify-end sm:px-6 sm:py-4">{footer}</div>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
