# Shape and elevation: radius, nested radius, shadows, borders, z-index

## Contents
- Beginner: the radius scale and what goes where
- Advanced: nested (concentric) radius, personality, comparison across systems
- Elevation: shadows, borders, dark mode
- Layering: z-index scale and stacking contexts
- Expert: continuous corners (squircles), asymmetric shapes

---

## Beginner: the radius scale and what goes where

| Token | px | Use |
|---|---|---|
| `rounded-xs` | 2 | Checkboxes, inline code, focus-ring offsets on tiny elements |
| `rounded-sm` | 4 | Tags, small chips, tooltips |
| `rounded-md` | 6 | **Buttons, inputs, selects (32–40px tall)** |
| `rounded-lg` | 8 | Menus, popovers, small cards, 48px controls |
| `rounded-xl` | 12 | **Cards, panels** |
| `rounded-2xl` | 16 | **Dialogs, sheets**, large media |
| `rounded-3xl` | 24 | Hero containers, very large cards |
| `rounded-full` | 9999 | Pills, avatars, switches, icon-only circular buttons |

In `tokens.css`, all of these derive from one `--radius` (default 8px). Change `--radius` and the whole product shifts personality while keeping its proportions.

**Rule of thumb:** a control's radius is about 15–20% of its height unless it is a pill. A 40px button → 6–8px.

**Bigger things get bigger radii.** A 12px card with 6px buttons inside looks intentional. 12px everywhere looks like a template.

## Advanced: nested (concentric) radius, personality, comparison across systems

### The nesting rule

When a rounded element sits inside another with padding between them, the corners only look parallel if:

> **outer radius = inner radius + padding** (and, for bordered elements, + border width)

Use the same radius on both, and the gap between them pinches at the corners and flares on the straight edges. Most people can't name the problem, but they notice it.

| Inner radius | Padding | Outer radius | Result |
|---|---|---|---|
| 8 | 8 | 16 | Even gap, calm |
| 12 | 4 | 16 | Tight segmented control or toolbar |
| 16 | 8 | 24 | Card containing an image |
| 6 | 16 | 22 | A button in a card: outer gets large. Either accept a softer card or set inner to max(outer − padding, 2px) |
| (computed 0) | 24 | 24 | Inner computes to 0 and looks broken. Floor it at 2–4px and judge by eye |
| 16 | 8 | 16 (wrong) | Pinched corners |

When padding is large (≥ the outer radius), the formula breaks down: the inner radius goes to zero. Pick the outer radius for the container's personality, then set the inner to `max(outer − padding, small floor)`.

```css
.frame { --r: 16px; --p: 8px; border-radius: var(--r); padding: var(--p); }
.frame > .inner { border-radius: max(4px, calc(var(--r) - var(--p))); }
```

In Tailwind with variables:

```html
<div class="rounded-[calc(var(--radius)*2)] p-2">
  <img class="rounded-[max(4px,calc(var(--radius)*2-0.5rem))]" … />
</div>
```

Apple's 2025 design system builds this in: shapes can be **fixed** (constant radius), **capsule** (radius = half the height) or **concentric** (radius = parent radius − padding), with a fallback radius for components that appear both nested and standalone. Treat that as the model even on the web.

### Radius as personality

| Radius family | Feels | Seen in |
|---|---|---|
| 0–2px | Technical, editorial, serious | IBM Carbon (0), Swiss-style editorial, enterprise tools |
| 4–8px | Neutral, professional, modern | GitHub Primer (6), Atlassian (controls 6, cards 8), Fluent (4) |
| 10–16px | Friendly, consumer, soft | shadcn/ui default (10), many SaaS products |
| Pills (full) | Playful, approachable, touch-first | Material 3 buttons, Apple's capsule controls |

Pick one family per product and commit to it. Mixing pill buttons, square inputs and 20px cards is the most common amateur tell.

### How major systems compare

| System | Scale | Buttons | Cards | Dialogs |
|---|---|---|---|---|
| Material 3 | 0 / 4 / 8 / 12 / 16 / 28 / full (dp) | full (pill) | 12 | 28 |
| Apple (iOS/macOS 26) | fixed / capsule / concentric | capsule for large controls | concentric | concentric |
| Atlassian | 2 / 4 / 6 / 8 / 12 / 16 / full | 6 | 8 | 12 |
| Fluent 2 | 2 / 4 / 6 / 8 (web tokens) | 4 | 4–8 | 8 |
| Primer | 6 default | 6 | 6–12 | 12 |
| shadcn/ui | `--radius` 10px; derived scale | md | xl | lg |
| Carbon | 0 | 0 | 0 | 0 |
| **Recommended** | 2 / 4 / 6 / 8 / 12 / 16 / 24 / full | 6 | 12 | 16 |

Systems revise these between versions; treat the Fluent and Primer card and dialog values as approximate and check the official docs before quoting them.

## Elevation: shadows, borders, dark mode

### Choose one depth method

| Method | Looks | Best for |
|---|---|---|
| **Border-led** | 1px `--border`, almost no shadows | Dense apps, dashboards, developer tools, dark-first products |
| **Shadow-led** | Soft shadows, few borders | Consumer apps, cards over photos, light-first products |
| Tonal | Surfaces differ by lightness | Dark mode (always), Material-style apps |

Combining a full-strength border with a full-strength shadow on every card is noisy. Pick one and use the other sparingly.

### Shadow scale

Real shadows have two parts: a tight, darker key shadow (contact) and a soft, wide ambient shadow. Single-layer `0 10px 30px rgba(0,0,0,.1)` blobs look generic.

| Token | Use | Value in `tokens.css` |
|---|---|---|
| `shadow-xs` | Inputs, subtle lift | `0 1px 2px` at 6% |
| `shadow-sm` | Cards at rest | two layers, 6% + 10% |
| `shadow-md` | Dropdowns, popovers, hovered cards | 2/4px + 4/8px |
| `shadow-lg` | Drawers, sticky bars on scroll | 4/8px + 12/24px |
| `shadow-xl` | Dialogs | 8/16px + 24/48px |

- **Higher z = bigger, softer, lower-opacity per pixel.** The element seems to float further from the surface.
- **Tint shadows** toward the background hue (`tokens.css` uses a dark navy, not pure black). On colored surfaces, use a darker shade of that color.
- **Light comes from the top.** Shadows go down (positive y), with little or no x offset.
- **Don't animate `box-shadow`.** Animate `opacity` on a pseudo-element that carries the larger shadow, or accept a small `transform`.

For reference, Fluent 2 uses six shadow levels (2, 4, 8, 16, 28, 64, where the number is the blur in px): 2–4 for cards, 8 for raised cards and app bars, 16 for hover cards and callouts, 28 for sheets and side navigation, 64 for dialogs.

### Dark mode depth

Shadows barely show on dark surfaces. Instead:
- Raise elevated surfaces in lightness: `--background` 0.17 → `--surface` 0.205 → `--surface-raised` 0.245 (OKLCH L).
- Add a 1px translucent white border (`oklch(1 0 0 / 0.1)`) to separate layers.
- Keep shadows on overlays (dialogs, menus) but make them darker and larger.

### Borders

- `--border` is for decorative dividers and card outlines. It may be low contrast because it carries no meaning.
- `--input` is for control boundaries that users must find (text fields, checkboxes, radios). It needs 3:1 against the background (SC 1.4.11).
- Use 1px borders. 2px only for emphasis (selected card, focus). Hairlines (0.5px) render inconsistently across screens.
- Prefer one divider between list items rather than boxing every item.

## Layering: z-index scale and stacking contexts

Never write `z-index: 9999`. Use the tokens:

| Token | Value | Layer |
|---|---|---|
| (auto) | 0–10 | In-flow content, raised cards |
| `--z-dropdown` | 1000 | Dropdowns, select menus |
| `--z-sticky` | 1100 | Sticky headers, sticky table columns |
| `--z-overlay` | 1300 | Scrims behind dialogs and drawers |
| `--z-modal` | 1400 | Dialogs, drawers |
| `--z-popover` | 1500 | Popovers opened from inside dialogs |
| `--z-toast` | 1700 | Toasts |
| `--z-tooltip` | 1800 | Tooltips (always on top) |

**Stacking contexts break z-index.** `transform`, `filter`, `opacity < 1`, `isolation: isolate`, `contain` and `position: fixed/sticky` with a z-index all create new contexts. A z-index of 1400 inside a transformed parent can still render below a sibling. Fixes:
- Render overlays in a portal attached to `<body>` (Radix, Headless UI and React's `createPortal` do this).
- Better: use the browser's **top layer**. `<dialog>` opened with `showModal()` and elements with the `popover` attribute render above everything without any z-index.

## Expert: continuous corners (squircles), asymmetric shapes

- **Continuous corners** (squircles) increase curvature gradually instead of meeting the straight edge abruptly, so large radii look smoother. Apple uses them everywhere (`RoundedRectangle(cornerRadius:, style: .continuous)` in SwiftUI).
- **On the web**, CSS `corner-shape: squircle` exists only in recent Chromium browsers. Use it as progressive enhancement:

```css
.card { border-radius: 16px; }
@supports (corner-shape: squircle) {
  .card { corner-shape: squircle; border-radius: 24px; } /* squircles need a larger value to look similar */
}
```

- **Asymmetric radii** signal direction: chat bubbles (small radius at the tail corner), bottom sheets (top corners only), attached segments in button groups (outer corners only, inner corners 0).
- **Button groups and segmented controls:** the container gets the outer radius; segments get `outer − padding` (concentric). If segments touch with no padding, round only their outermost corners.
- **Images in cards** that bleed to the card edge: round only the touching corners (`rounded-t-xl` on the image with `overflow-hidden` on the card).
