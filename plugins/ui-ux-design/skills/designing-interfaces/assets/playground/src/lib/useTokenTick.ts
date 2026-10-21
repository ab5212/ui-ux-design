import { useEffect, useState } from "react";
import { cssVar } from "@/lib/contrast";

/** Re-render when the page's tokens change (theme, style, hue, colors, radius): a class on <html> or the live style element in <head>. */
export function useTokenTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const a = new MutationObserver(bump);
    a.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-radius", "data-preset", "data-density"] });
    const b = new MutationObserver(bump);
    b.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => { a.disconnect(); b.disconnect(); };
  }, []);
  return tick;
}

/** A length token (rem or px) in pixels, as the browser resolves it right now. */
export function tokenPx(name: string) {
  const v = cssVar(name);
  const n = parseFloat(v) || 0;
  return v.endsWith("rem") ? n * parseFloat(getComputedStyle(document.documentElement).fontSize) : n;
}
