import { cn } from "@/lib/cn";

export function Section({ id, title, intro, children }: { id: string; title: string; intro?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t py-10 first-of-type:border-t-0 first-of-type:pt-2 sm:py-14">
      <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.01em] text-balance">
        {title}
      </h2>
      {intro && <p className="mt-2 max-w-[65ch] text-muted-foreground text-pretty">{intro}</p>}
      {/* grid-cols-1 = minmax(0,1fr): lets wide children (tables) scroll instead of stretching the page */}
      <div className="mt-8 grid grid-cols-1 gap-10">{children}</div>
    </section>
  );
}

export function Demo({ title, note, children, className }: { title: string; note?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-base font-semibold">{title}</h3>
        {note && <p className="text-sm text-muted-foreground">{note}</p>}
      </div>
      <div className={cn("min-w-0 rounded-xl border bg-surface p-4 sm:p-6", className)}>{children}</div>
    </div>
  );
}

/** Compact spec table shown under demos. */
export function Spec({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="font-mono text-[13px]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
