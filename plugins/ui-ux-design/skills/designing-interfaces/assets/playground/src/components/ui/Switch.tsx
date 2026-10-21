import { useId } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/cn";

/** Switch: for settings that apply immediately. The label names the setting, not the state. */
export function Switch({
  label,
  description,
  className,
  ...props
}: SwitchPrimitive.SwitchProps & { label: string; description?: string }) {
  const id = useId();
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <label htmlFor={id} className="grid cursor-pointer gap-0.5 text-sm">
        <span className="font-medium">{label}</span>
        {description && <span className="text-muted-foreground">{description}</span>}
      </label>
      <SwitchPrimitive.Root
        id={id}
        className="peer relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent
          bg-input transition-colors duration-(--duration-fast) data-[state=checked]:bg-primary
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
          disabled:cursor-not-allowed disabled:opacity-50
          before:absolute before:-inset-2.5 before:content-['']"
        {...props}
      >
        <SwitchPrimitive.Thumb
          className="block size-5 translate-x-0.5 rounded-full bg-surface shadow-sm transition-transform duration-(--duration-base)
            ease-(--ease-standard) data-[state=checked]:translate-x-[22px] rtl:-translate-x-0.5 rtl:data-[state=checked]:-translate-x-[22px]"
        />
      </SwitchPrimitive.Root>
    </div>
  );
}
