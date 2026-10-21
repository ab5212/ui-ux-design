import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/* ---------- Badge ---------- */
export const badgeVariants = cva("inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap", {
  variants: {
    tone: {
      neutral: "bg-muted text-foreground",
      info: "bg-info/12 text-foreground [&>.dot]:bg-info",
      success: "bg-success/12 text-foreground [&>.dot]:bg-success",
      warning: "bg-warning/20 text-foreground [&>.dot]:bg-warning",
      destructive: "bg-destructive/12 text-foreground [&>.dot]:bg-destructive",
      primary: "bg-primary text-primary-foreground",
    },
  },
  defaultVariants: { tone: "neutral" },
});

/** Status badges pair color with text; the dot is decoration, not the message. */
export function Badge({ tone, dot, children, className }: VariantProps<typeof badgeVariants> & { dot?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(badgeVariants({ tone }), className)}>
      {dot && <span aria-hidden className="dot size-1.5 rounded-full bg-muted-foreground" />}
      {children}
    </span>
  );
}

/* ---------- Card ---------- */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border bg-surface p-4 sm:p-6", className)} {...props} />;
}

/* ---------- Alert ---------- */
const alertIcons = { info: Info, success: CheckCircle2, warning: AlertTriangle, destructive: XCircle };
const alertTone = {
  info: "border-info/40 bg-info/8 [&>svg]:text-info",
  success: "border-success/40 bg-success/8 [&>svg]:text-success",
  warning: "border-warning/60 bg-warning/12 [&>svg]:text-warning-foreground dark:[&>svg]:text-warning",
  destructive: "border-destructive/40 bg-destructive/8 [&>svg]:text-destructive",
};

export function Alert({ tone = "info", title, children, action }: { tone?: keyof typeof alertTone; title?: string; children: React.ReactNode; action?: React.ReactNode }) {
  const Icon = alertIcons[tone];
  return (
    <div className={cn("flex gap-3 rounded-lg border p-4 text-sm", alertTone[tone])}>
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div className="grid flex-1 gap-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-foreground/90">{children}</div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}

/* ---------- Skeleton, Progress, Spinner ---------- */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton-shimmer rounded-md", className)} />;
}

export function Progress({ value, label }: { value?: number; label: string }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        {value !== undefined && <span className="tabular-nums text-muted-foreground">{value}%</span>}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full bg-primary transition-[width] duration-(--duration-slow)", value === undefined && "w-1/3 animate-pulse")}
          style={value !== undefined ? { width: `${value}%` } : undefined}
        />
      </div>
    </div>
  );
}

export function Spinner({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <span role="status" className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span>{label}…</span>
    </span>
  );
}

/* ---------- Avatar ---------- */
const avatarSizes = { 24: "size-6 text-[10px]", 32: "size-8 text-xs", 40: "size-10 text-sm", 48: "size-12 text-base" };
export function Avatar({ name, size = 40, square }: { name: string; size?: keyof typeof avatarSizes; square?: boolean }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  return (
    <span
      role="img"
      aria-label={name}
      className={cn("inline-flex shrink-0 items-center justify-center font-medium", square ? "rounded-md" : "rounded-full", avatarSizes[size])}
      style={{ background: `oklch(0.9 0.05 ${hue})`, color: `oklch(0.32 0.08 ${hue})` }}
    >
      {initials}
    </span>
  );
}

/* ---------- Toast ---------- */
interface ToastItem { id: number; message: string; action?: { label: string; onClick: () => void } }
const ToastCtx = createContext<(t: Omit<ToastItem, "id">) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

/** Polite live region that exists before content changes; toasts pause while hovered or focused. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, number>());
  const dismiss = useCallback((id: number) => {
    setItems((xs) => xs.filter((x) => x.id !== id));
    clearTimeout(timers.current.get(id));
  }, []);
  const schedule = useCallback((id: number) => {
    timers.current.set(id, window.setTimeout(() => dismiss(id), 5000));
  }, [dismiss]);
  const push = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs.slice(-2), { ...t, id }]);
    schedule(id);
  }, [schedule]);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-(--z-toast) flex flex-col items-center gap-2 sm:inset-x-auto sm:end-4 sm:items-end"
      >
        {items.map((t) => (
          <div
            key={t.id}
            onMouseEnter={() => clearTimeout(timers.current.get(t.id))}
            onMouseLeave={() => schedule(t.id)}
            onFocus={() => clearTimeout(timers.current.get(t.id))}
            onBlur={() => schedule(t.id)}
            className="anim-toast pointer-events-auto flex w-full items-center gap-3 rounded-lg bg-foreground py-2 ps-4 pe-2 text-sm text-background shadow-lg sm:w-96"
          >
            <span className="flex-1">{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => { t.action!.onClick(); dismiss(t.id); }}
                className="rounded-md px-2 py-1.5 font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-background"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismiss(t.id)}
              className="inline-flex size-8 items-center justify-center rounded-md opacity-70 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-background"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
