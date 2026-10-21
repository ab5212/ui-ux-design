import { Demo } from "../Section";

const SCALE = [
  { cls: "text-5xl font-semibold tracking-[-0.025em] leading-none", token: "text-5xl", size: "48/48", role: "display" },
  { cls: "text-4xl font-semibold tracking-[-0.02em]", token: "text-4xl", size: "36/40", role: "marketing title" },
  { cls: "text-3xl font-semibold tracking-[-0.015em]", token: "text-3xl", size: "30/36", role: "page title" },
  { cls: "text-2xl font-semibold tracking-[-0.01em]", token: "text-2xl", size: "24/32", role: "section" },
  { cls: "text-xl font-semibold", token: "text-xl", size: "20/28", role: "card title" },
  { cls: "text-lg", token: "text-lg", size: "18/28", role: "lead" },
  { cls: "text-base", token: "text-base", size: "16/24", role: "body" },
  { cls: "text-sm", token: "text-sm", size: "14/20", role: "dense UI" },
  { cls: "text-xs text-muted-foreground", token: "text-xs", size: "12/16", role: "meta" },
];

export function TypeFoundation() {
  return (
    <>
      <Demo title="Scale" note="Ratio ≈ 1.25. Headings tighten tracking and line height as they grow.">
        <div className="grid gap-5">
          {SCALE.map((s) => (
            <div key={s.token} className="grid gap-1 sm:grid-cols-[6rem_4rem_9rem_1fr] sm:items-baseline sm:gap-4">
              <code className="text-xs">{s.token}</code>
              <span className="text-xs tabular-nums text-muted-foreground">{s.size}</span>
              <span className="text-xs text-muted-foreground">{s.role}</span>
              <p className={`${s.cls} min-w-0 truncate`}>Quarterly revenue grew</p>
            </div>
          ))}
        </div>
      </Demo>
      <Demo title="Measure and numbers" note="Prose capped at 65ch; tabular figures align in columns.">
        <div className="grid gap-8 lg:grid-cols-[1fr_16rem]">
          <p className="max-w-[65ch] text-pretty">
            Comfortable reading needs lines of roughly 45 to 90 characters. Beyond that the eye loses its place when it returns to the start of
            the next line; much shorter, and reading becomes choppy. This paragraph is capped at 65ch, and wraps with text-wrap: pretty to
            avoid a lonely last word.
          </p>
          <table className="w-full text-sm">
            <caption className="sr-only">Tabular figures example</caption>
            <tbody className="tabular-nums">
              {[["Hosting", "1,204.00"], ["Storage", "88.50"], ["Support", "349.99"], ["Total", "1,642.49"]].map(([k, v]) => (
                <tr key={k} className="border-b last:border-0 last:font-semibold">
                  <th scope="row" className="py-1.5 text-start font-normal">{k}</th>
                  <td className="py-1.5 text-end">${v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Demo>
    </>
  );
}
