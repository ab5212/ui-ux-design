/**
 * Live contrast measurement for CSS custom properties.
 * Uses a 1×1 canvas so any color syntax the browser understands (oklch, color-mix, hex…) works.
 */
let ctx: CanvasRenderingContext2D | null = null;

function toRgba(color: string, under = "rgb(255,255,255)"): [number, number, number] {
  if (!ctx) {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    ctx = c.getContext("2d", { willReadFrequently: true });
  }
  if (!ctx) return [0, 0, 0];
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = under;
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

const lin = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

export function cssVar(name: string, el: Element = document.documentElement) {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

export function wcagRatio(fg: string, bg: string, base: string) {
  const b = toRgba(bg, base);
  const f = toRgba(fg, `rgb(${b.join(",")})`);
  const [hi, lo] = [lum(f), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** APCA-W3 0.0.98G-4g — advisory only (draft method for WCAG 3). */
export function apcaLc(fg: string, bg: string, base: string) {
  const b = toRgba(bg, base);
  const f = toRgba(fg, `rgb(${b.join(",")})`);
  const Y = ([r, g, bl]: number[]) =>
    0.2126729 * (r / 255) ** 2.4 + 0.7151522 * (g / 255) ** 2.4 + 0.072175 * (bl / 255) ** 2.4;
  const clampY = (y: number) => (y > 0.022 ? y : y + (0.022 - y) ** 1.414);
  const t = clampY(Y(f));
  const s = clampY(Y(b));
  if (Math.abs(s - t) < 0.0005) return 0;
  if (s > t) {
    const c = (s ** 0.56 - t ** 0.57) * 1.14;
    return c < 0.1 ? 0 : (c - 0.027) * 100;
  }
  const c = (s ** 0.65 - t ** 0.62) * 1.14;
  return c > -0.1 ? 0 : (c + 0.027) * 100;
}

/** Any CSS color the browser understands -> #rrggbb (what <input type="color"> needs). */
export function toHex(color: string) {
  const [r, g, b] = toRgba(color);
  return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
}
