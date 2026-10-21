import { cssVar, wcagRatio, toHex } from "@/lib/contrast";
import { LINES, PAIRS } from "@/lib/tokens";
import { useTokenTick } from "@/lib/useTokenTick";
import { isDark, type Settings } from "@/lib/settings";

const name = (token: string) => token.slice(2);
const AUTO_TEXT = ["#ffffff", "#111111"];

function Swatch({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  return (
    <input type="color" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
      className="size-7 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-0.5" />
  );
}

export function ColorEditor({ settings, update }: { settings: Settings; update: (p: Partial<Settings>) => void }) {
  useTokenTick();
  const mode = isDark(settings) ? "dark" : "light";
  const base = cssVar("--background");
  const current = (token: string) => settings.colors[name(token)]?.[mode] ?? toHex(cssVar(token));

  // Set one or more tokens for the theme being shown; the other theme keeps its own values.
  const set = (patch: Record<string, string>) => {
    const colors = { ...settings.colors };
    for (const [token, hex] of Object.entries(patch)) colors[name(token)] = { ...colors[name(token)], [mode]: hex };
    update({ colors });
  };
  const reset = (tokens: string[]) => {
    const colors = { ...settings.colors };
    for (const t of tokens) {
      const { [mode]: _drop, ...rest } = colors[name(t)] ?? {};
      if (Object.keys(rest).length) colors[name(t)] = rest; else delete colors[name(t)];
    }
    update({ colors });
  };
  const changed = (tokens: string[]) => tokens.some((t) => settings.colors[name(t)]?.[mode]);

  // Changing a fill keeps its text readable: if the pair drops below 4.5:1, switch the text to white or near-black.
  const setFill = (fill: string, fg: string, hex: string) => {
    const keep = wcagRatio(current(fg), hex, base) >= 4.5;
    const best = AUTO_TEXT.map((t) => [t, wcagRatio(t, hex, base)] as const).sort((a, b) => b[1] - a[1])[0][0];
    set(keep ? { [fill]: hex } : { [fill]: hex, [fg]: best });
  };

  const chip = (r: number, min: number) => (
    <span className={`rounded-sm px-1.5 py-0.5 text-xs font-medium tabular-nums ${r >= min ? "bg-success/12" : "bg-destructive/12"}`}>{r.toFixed(1)}:1</span>
  );
  const allTokens = [...PAIRS.flatMap((p) => [p.fill, p.fg]), ...LINES.map((l) => l.token)];

  return (
    <div className="grid gap-2">
      <p className="text-xs text-muted-foreground">Editing the <strong className="text-foreground">{mode}</strong> theme. Switch theme to edit the other.</p>
      <ul className="grid gap-1.5">
        {PAIRS.map((p) => {
          const tokens = [p.fill, p.fg];
          return (
            <li key={p.fill} className="flex items-center gap-2 text-sm">
              <span className="min-w-0 flex-1 truncate">{p.label}</span>
              <Swatch label={`${p.label} color`} value={current(p.fill)} onChange={(hex) => setFill(p.fill, p.fg, hex)} />
              <Swatch label={`${p.label} text color`} value={current(p.fg)} onChange={(hex) => set({ [p.fg]: hex })} />
              {chip(wcagRatio(current(p.fg), current(p.fill), base), p.min)}
              <button type="button" aria-label={`Reset ${p.label}`} disabled={!changed(tokens)} onClick={() => reset(tokens)}
                className="icon material-symbols-rounded text-base text-muted-foreground enabled:hover:text-foreground disabled:opacity-30">undo</button>
            </li>
          );
        })}
        {LINES.map((l) => (
          <li key={l.token} className="flex items-center gap-2 text-sm">
            <span className="min-w-0 flex-1 truncate">{l.label.replace(" (decorative)", "")}</span>
            <Swatch label={`${l.label} color`} value={current(l.token)} onChange={(hex) => set({ [l.token]: hex })} />
            {l.min ? chip(wcagRatio(current(l.token), cssVar("--background"), base), l.min) : <span className="w-[3.2rem]" />}
            <button type="button" aria-label={`Reset ${l.label}`} disabled={!changed([l.token])} onClick={() => reset([l.token])}
              className="icon material-symbols-rounded text-base text-muted-foreground enabled:hover:text-foreground disabled:opacity-30">undo</button>
          </li>
        ))}
      </ul>
      <button type="button" disabled={!changed(allTokens)} onClick={() => reset(allTokens)}
        className="justify-self-start text-xs font-medium text-primary underline-offset-2 hover:underline disabled:text-muted-foreground disabled:no-underline">
        Reset all colors
      </button>
    </div>
  );
}
