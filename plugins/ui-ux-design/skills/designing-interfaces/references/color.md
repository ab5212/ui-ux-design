# Color

## Contents
- Beginner: the 60-30-10 habit, semantic roles, contrast minimums
- Advanced: building palettes in OKLCH, states, dark mode, status colors, data visualization
- Expert: APCA, gamut, brand hues that resist contrast, auditing

---

## Beginner: the 60-30-10 habit, semantic roles, contrast minimums

**Restraint makes interfaces look expensive.** About 90% of a product UI is neutral surfaces and text. The brand color goes on the primary action, links, focus and selection. Status colors appear only when there is a status.

| Share | Role | Tokens |
|---|---|---|
| ~60% | Background and surfaces | `--background`, `--surface`, `--muted` |
| ~30% | Text and lines | `--foreground`, `--muted-foreground`, `--border`, `--input` |
| ~10% | Accent and status | `--primary`, `--ring`, `--destructive`, `--success`, … |

### Contrast minimums (WCAG 2.2 AA)

| What | Minimum |
|---|---|
| Body text and labels | 4.5:1 |
| Large text (24px+, or 18.66px+ bold) | 3:1 |
| Input borders, checkbox outlines, icons that convey meaning, chart lines (SC 1.4.11) | 3:1 against adjacent colors |
| Focus indicator | 3:1 against what surrounds it |
| Disabled controls, logos, pure decoration | Exempt, but keep them distinguishable |

Run `node scripts/check-contrast.mjs your-tokens.css` to check every semantic pair in both themes.

### Three mistakes to never make

1. Using color as the only signal. A red border alone doesn't mean "error" to a colorblind user (about 1 in 12 men). Add an icon and a message.
2. Placeholder-gray body text. If text matters enough to show, it needs 4.5:1.
3. `text-white` on a brand fill. Use the `-foreground` token so dark mode and rebrands still work.

## Advanced: building palettes in OKLCH, states, dark mode, status colors, data visualization

### Why OKLCH

OKLCH has three channels: lightness (0–1), chroma (0–~0.37) and hue (0–360°). Its lightness tracks perceived brightness, unlike HSL, where yellow and blue at "50% lightness" look nothing alike. That gives three practical benefits:

- A ramp built by stepping lightness looks evenly spaced.
- Swapping the hue (rebranding) roughly preserves contrast.
- You can predict contrast from lightness: text and background about 0.45–0.5 L apart usually pass 4.5:1.

All modern browsers support `oklch()`. Tailwind v4's default palette is defined in OKLCH.

### Building a ramp (11 steps)

| Step | L (light-mode use) | Typical role |
|---|---|---|
| 50 | 0.97–0.98 | Tinted background, selected row |
| 100 | 0.94–0.95 | Hover fill, accent |
| 200 | 0.89–0.91 | Borders on tinted surfaces |
| 300 | 0.82–0.85 | Disabled fills, dark-mode text accents |
| 400 | 0.72–0.76 | Dark-mode primary |
| 500 | 0.6–0.65 | Icons, chart series |
| 600 | 0.5–0.55 | Light-mode primary, links |
| 700 | 0.42–0.46 | Hover/pressed primary |
| 800 | 0.35–0.38 | Text on 50/100 tints |
| 900 | 0.27–0.3 | Headings in brand color |
| 950 | 0.19–0.21 | Dark-mode tinted surfaces |

Lower chroma at both ends (near white and near black): high chroma at extreme lightness falls outside sRGB and gets clipped unpredictably. Tint neutrals with a little chroma (0.005–0.015) toward the brand hue. Pure gray (chroma 0) looks lifeless next to a saturated brand color.

### Interaction states

| State | Change |
|---|---|
| Hover | Fill L −0.04 to −0.06 (light) or +0.04 (dark); or an 8% `currentColor` overlay |
| Pressed / active | L −0.08 to −0.1, or a 12% overlay |
| Selected | `--accent` fill plus a non-color cue (check, bar, bold text) |
| Focus | `--ring` outline; never only a color change of the fill |
| Disabled | Opacity 0.5 on the whole control, `cursor: not-allowed`, no hover change |

Overlays (Material's "state layers") work on any fill without extra tokens:

```css
.btn { position: relative; }
.btn::after { content: ""; position: absolute; inset: 0; border-radius: inherit;
  background: currentColor; opacity: 0; transition: opacity var(--duration-fast); }
.btn:hover::after { opacity: .08; } .btn:active::after { opacity: .12; }
```

### Dark mode is a separate design

| Rule | Why |
|---|---|
| Background near-black, around L 0.14–0.18, not `#000` | Pure black behind white text causes halation (glow) and smearing on OLED when scrolling |
| Higher surfaces are lighter (`--surface` > `--background`) | Shadows are invisible on dark, so lightness carries elevation |
| Primary gets lighter (L 0.7–0.78) and less saturated (chroma −10–20%) | Saturated mid-tones vibrate on dark backgrounds and fail contrast |
| Text on primary becomes dark | A light primary needs dark text to pass |
| Borders are translucent white (8–12%) | Adapts to any surface level |
| Status colors become lighter tints | Red 0.53 L on near-black fails; 0.7 passes |
| Images and illustrations may need a dimmed variant | A white-background PNG becomes a glaring rectangle |

Test dark mode as its own theme: contrast, focus visibility, charts, empty-state illustrations and third-party embeds.

### Status colors

| Status | Hue (approx.) | Rules |
|---|---|---|
| Destructive / error | 25–30 (red) | Destructive actions and errors only. Not for "important" |
| Warning | 70–85 (amber) | Needs dark text: amber with white text never passes |
| Success | 145–155 (green) | Confirmations. Use sparingly; success is the default state |
| Info | 230–240 (blue) | Must still differ from the brand if the brand is blue; shift the hue or use neutral info |

For every status message use three signals: color, an icon and words.

### Data visualization

- Use a categorical palette of up to 8 colors, distinct in both hue and lightness, so it still works in grayscale and for color-vision deficiencies.
- For sequential data use one hue ramped in lightness; for diverging data use two hues meeting at a neutral midpoint.
- Lines and bars need 3:1 against the chart background. Label series directly rather than relying on a legend.
- Keep red and green for meaning (bad and good), not for series 1 and series 2.

## Expert: APCA, gamut, brand hues that resist contrast, auditing

### APCA (advisory)

WCAG 2's ratio is mathematically simple but perceptually flawed. It overrates dark-on-dark and is blind to font weight and size. APCA (the candidate method for WCAG 3, still a draft) outputs a lightness contrast value, Lc:

| Use | Lc target |
|---|---|
| Body text 16px/400 | 75+ (90 preferred) |
| Large or bold text, UI labels | 60+ |
| Non-text UI (borders, icons) | 45+ |
| Placeholder, disabled | 30+ |

APCA is polarity-aware: the same gray pair scores differently as dark-on-light versus light-on-dark. Meet WCAG 2.2 AA first, because it is the legal baseline (European Accessibility Act, ADA). Use APCA to catch dark-mode pairs that technically pass but read poorly. `check-contrast.mjs` reports both.

### Gamut

OKLCH can describe colors outside sRGB. Browsers clip them, and different engines clip differently. Keep chroma at or below about 0.17 for mid lightness and lower near the ends. If you want P3 vibrancy, add it with `@media (color-gamut: p3)` and keep the sRGB value as the base.

### Brand hues that resist contrast

Yellow, lime, cyan and orange are inherently light. At L 0.5 they become muddy olive or brown. Options:

- Keep the brand color for large surfaces and illustration, and use a darker sibling for text and buttons.
- Use the brand color as a fill with dark foreground text (amber buttons with near-black text).
- Pick an off-brand "action" color and accept that the button isn't the logo color. Most strong brands do this.

### Auditing an existing UI

1. Extract every color in use (`grep -Eo '#[0-9a-fA-F]{3,8}|oklch\([^)]*\)|rgb\([^)]*\)'`).
2. Count them. More than about 12 distinct non-brand grays means the palette is accidental.
3. Map each to a semantic token or delete it.
4. Run the contrast script and fix failures by moving lightness, not hue.
5. Simulate color-vision deficiencies (Chrome DevTools → Rendering → Emulate vision deficiencies) and check that every status remains understandable.
