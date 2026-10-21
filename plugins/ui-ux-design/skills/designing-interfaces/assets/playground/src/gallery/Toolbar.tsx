import { useId } from "react";
import type { Density, Radius, Settings, Theme } from "@/lib/settings";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/cn";

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground" id={`seg-${label}`}>{label}</span>
      <div role="radiogroup" aria-labelledby={`seg-${label}`} className="inline-flex gap-1 rounded-lg bg-muted p-1">
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
            className={cn("h-7 rounded-md px-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring",
              value === o.value ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toolbar({ settings, update, className }: { settings: Settings; update: (p: Partial<Settings>) => void; className?: string }) {
  const hueId = useId();
  return (
    <div className={cn("flex flex-wrap items-end gap-x-6 gap-y-4", className)}>
      <Segmented<Theme> label="Theme" value={settings.theme} onChange={(theme) => update({ theme })}
        options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }]} />
      <Segmented<Density> label="Density" value={settings.density} onChange={(density) => update({ density })}
        options={[{ value: "compact", label: "Compact" }, { value: "default", label: "Default" }, { value: "comfortable", label: "Comfortable" }]} />
      <Segmented<Radius> label="Radius" value={settings.radius} onChange={(radius) => update({ radius })}
        options={[{ value: "sharp", label: "Sharp" }, { value: "default", label: "Default" }, { value: "round", label: "Round" }]} />
      <div className="grid gap-1.5">
        <label htmlFor={hueId} className="text-xs font-medium text-muted-foreground">
          Brand hue <span className="tabular-nums">{settings.hue}°</span>
        </label>
        <input id={hueId} type="range" min={0} max={360} value={settings.hue} onChange={(e) => update({ hue: +e.target.value })}
          className="h-9 w-40 accent-(--primary)" />
      </div>
      <Switch label="Reduced motion" checked={settings.reducedMotion} onCheckedChange={(reducedMotion) => update({ reducedMotion })} className="items-center" />
    </div>
  );
}
