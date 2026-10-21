import { forwardRef, useId } from "react";
import { AlertCircle } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const controlBase =
  "w-full min-w-0 rounded-md border bg-surface px-3 text-base text-foreground sm:text-sm " +
  "placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-(--duration-fast) " +
  "border-input focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring " +
  "disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-muted " +
  "aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive";

export const inputClass = cn(controlBase, "h-(--control-h-md)");
export const textareaClass = cn(controlBase, "min-h-24 py-2 resize-y");

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
}

/** Label above, control, then hint or error — wired with aria-describedby. */
export function Field({ label, hint, error, optional, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && !error ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm text-destructive">
          <AlertCircle aria-hidden className="mt-0.5 text-base shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return <input ref={ref} className={cn(inputClass, className)} {...props} />;
});

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(textareaClass, className)} {...props} />;
}

/** Native select: best on touch, accessible by default. Only the closed state is styled. */
export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(inputClass, "appearance-none pe-9", className)} {...props}>
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      >
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function Checkbox({ label, description, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string }) {
  const id = useId();
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span className="relative mt-0.5 inline-flex size-[18px] shrink-0">
        <input
          id={id}
          type="checkbox"
          className="peer size-full cursor-pointer appearance-none rounded-xs border border-input bg-surface
            checked:border-primary checked:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
            disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="pointer-events-none absolute inset-0 size-full text-primary-foreground opacity-0 peer-checked:opacity-100"
        >
          <path d="M4 8.5l2.5 2.5L12 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <label htmlFor={id} className="grid min-h-6 cursor-pointer gap-0.5 text-sm">
        <span className="font-medium">{label}</span>
        {description && <span className="text-muted-foreground">{description}</span>}
      </label>
    </div>
  );
}

export function RadioGroup({
  legend,
  name,
  options,
  defaultValue,
}: {
  legend: string;
  name: string;
  options: { value: string; label: string; description?: string }[];
  defaultValue?: string;
}) {
  const base = useId();
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      {options.map((o) => (
        <div key={o.value} className="flex items-start gap-3">
          <input
            id={`${base}-${o.value}`}
            type="radio"
            name={name}
            value={o.value}
            defaultChecked={o.value === defaultValue}
            className="mt-0.5 size-[18px] shrink-0 cursor-pointer appearance-none rounded-full border border-input bg-surface
              checked:border-[5px] checked:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
          <label htmlFor={`${base}-${o.value}`} className="grid min-h-6 cursor-pointer gap-0.5 text-sm">
            <span className="font-medium">{o.label}</span>
            {o.description && <span className="text-muted-foreground">{o.description}</span>}
          </label>
        </div>
      ))}
    </fieldset>
  );
}
