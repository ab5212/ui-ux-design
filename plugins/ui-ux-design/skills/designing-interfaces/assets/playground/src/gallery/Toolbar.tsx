import { useId, useState } from "react";
import { fontLinks, save, type Borders, type Density, type Radius, type Settings, type Shadow, type Spacing, type TextSize, type Theme } from "@/lib/settings";
import { Switch } from "@/components/ui/Switch";
import { Select } from "@/components/ui/Field";
import { PRESETS, PRESET_LABELS } from "@/lib/presets";
import { ColorEditor } from "@/gallery/ColorEditor";
import { cn } from "@/lib/cn";

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground" id={id}>{label}</span>
      <div role="radiogroup" aria-labelledby={id} className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg bg-muted p-1">
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
            className={cn("h-8 rounded-md px-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              value === o.value ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Writes everything (style, colors, layout, element edits) to the user's files. */
export function SaveBar({ settings, className }: { settings: Settings; className?: string }) {
  const [status, setStatus] = useState("");
  const onSave = () => {
    setStatus("Saving…");
    save(settings).then((r) => setStatus(`Saved to ${r.file}.${r.files.length ? " Also wrote " + r.files.join(", ") + "." : ""}${fontLinks(settings).length ? " Add the Google Fonts link to your app: " + fontLinks(settings).join(" ") : ""}`), (e: Error) => setStatus(`Not saved: ${e.message}`));
  };
  return (
    <div className={cn("sticky bottom-0 z-10 -mx-1 mt-6 grid gap-2 border-t bg-surface px-1 pb-5 pt-4", className)}>
      <button type="button" onClick={onSave}
        className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        Save to code
      </button>
      <p role="status" className="min-h-4 break-all text-xs text-muted-foreground">{status || "Writes these choices into your files."}</p>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-3 border-0 p-0">
      <legend className="mb-1 text-xs font-semibold uppercase tracking-wider text-foreground/70">{title}</legend>
      {children}
    </fieldset>
  );
}

const GOOGLE_FONTS = ["Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Nunito", "DM Sans", "Manrope", "Plus Jakarta Sans", "Work Sans", "Outfit", "Space Grotesk", "Archivo", "IBM Plex Sans", "Source Sans 3", "Noto Sans", "Rubik", "Figtree", "Sora", "Playfair Display", "Source Serif 4", "DM Serif Display", "Cormorant Garamond", "Libre Baskerville", "Lora", "Merriweather", "Cinzel", "Orbitron", "Josefin Sans", "Roboto Mono", "JetBrains Mono", "Space Mono", "Fira Code", "IBM Plex Mono"];

const HUES = "linear-gradient(90deg," + [0, 60, 120, 180, 240, 300, 360].map((h) => `oklch(0.7 0.15 ${h})`).join(",") + ")";

/** Grouped style controls. Used in the right-hand panel on wide screens and inside a dialog on small ones. */
export function Toolbar({ settings, update, className, footer = true }: { settings: Settings; update: (p: Partial<Settings>) => void; className?: string; footer?: boolean }) {
  const hueId = useId();
  const styleId = useId();
  const fontId = useId();
  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="grid flex-1 content-start gap-7">
        <Group title="Style">
          <div className="grid gap-1.5">
            <label htmlFor={styleId} className="text-xs font-medium text-muted-foreground">Look and feel</label>
            <Select id={styleId} value={settings.preset}
              onChange={(e) => update({ preset: e.target.value, radius: "default", borders: "default", shadow: "default", font: "", spacing: "default", textSize: "default", density: "default" })}>
              <option value="base">Clean and minimal (base)</option>
              {Object.keys(PRESETS).sort().map((k) => <option key={k} value={k}>{PRESET_LABELS[k] ?? k}</option>)}
            </Select>
          </div>
        </Group>
        <Group title="Color">
          <Segmented<Theme> label="Theme" value={settings.theme} onChange={(theme) => update({ theme })}
            options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }]} />
          <div className="grid gap-2">
            <label htmlFor={hueId} className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              Brand hue
              <span className="flex items-center gap-2 tabular-nums text-foreground">
                <span aria-hidden className="size-4 rounded-full border bg-primary" />{settings.hue}°
              </span>
            </label>
            <input id={hueId} type="range" min={0} max={360} value={settings.hue} onChange={(e) => update({ hue: +e.target.value })}
              className="hue-range h-3 w-full cursor-pointer appearance-none rounded-full" style={{ background: HUES }} />
          </div>
        </Group>
        <Group title="Colors">
          <details className="group rounded-lg border">
            <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-medium">
              Edit any color <span aria-hidden className="icon material-symbols-rounded text-base transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="border-t p-3"><ColorEditor settings={settings} update={update} /></div>
          </details>
        </Group>
        <Group title="Shape">
          <Segmented<Radius> label="Corners" value={settings.radius} onChange={(radius) => update({ radius })}
            options={[{ value: "sharp", label: "Sharp" }, { value: "default", label: "Default" }, { value: "round", label: "Round" }]} />
          <Segmented<Borders> label="Borders" value={settings.borders} onChange={(borders) => update({ borders })}
            options={[{ value: "none", label: "None" }, { value: "default", label: "Default" }, { value: "bold", label: "Bold" }]} />
          <Segmented<Shadow> label="Shadows" value={settings.shadow} onChange={(shadow) => update({ shadow })}
            options={[{ value: "none", label: "None" }, { value: "subtle", label: "Soft" }, { value: "default", label: "Base" }, { value: "strong", label: "Strong" }]} />
        </Group>
        <Group title="Type">
          <div className="grid gap-1.5">
            <label htmlFor={fontId} className="text-xs font-medium text-muted-foreground">Font (any Google Font)</label>
            <input id={fontId} list={`${fontId}-list`} value={settings.font} placeholder="From the style" autoComplete="off" spellCheck={false}
              onChange={(e) => update({ font: e.target.value })}
              className="h-10 rounded-md border border-input bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring" />
            <datalist id={`${fontId}-list`}>{GOOGLE_FONTS.map((f) => <option key={f} value={f} />)}</datalist>
          </div>
          <Segmented<TextSize> label="Text size" value={settings.textSize} onChange={(textSize) => update({ textSize })}
            options={[{ value: "small", label: "Small" }, { value: "default", label: "Default" }, { value: "large", label: "Large" }]} />
        </Group>
        <Group title="Layout">
          <Segmented<Density> label="Density" value={settings.density} onChange={(density) => update({ density })}
            options={[{ value: "compact", label: "Compact" }, { value: "default", label: "Default" }, { value: "comfortable", label: "Roomy" }]} />
          <Segmented<Spacing> label="Spacing" value={settings.spacing} onChange={(spacing) => update({ spacing })}
            options={[{ value: "tight", label: "Tight" }, { value: "default", label: "Default" }, { value: "loose", label: "Loose" }]} />
        </Group>
        <Group title="Motion">
          <Switch label="Reduced motion" checked={settings.reducedMotion} onCheckedChange={(reducedMotion) => update({ reducedMotion })} className="items-center" />
        </Group>
      </div>
      {footer && <SaveBar settings={settings} />}
    </div>
  );
}
