# Visual styles

How to implement each well-known aesthetic, when it fits, and how it fails. A style is a coat of paint over the foundations. Tokens, contrast, spacing and states still apply.

## Contents
- Choosing a style
- Flat / minimal
- Material
- Skeuomorphism
- Neumorphism (soft UI)
- Glassmorphism and Apple Liquid Glass
- Claymorphism
- Neo-brutalism
- Swiss / International style
- Bento grid
- Gradient / aurora
- Dark UI
- Mixing styles

---

## Choosing a style

| Product | Good fits | Poor fits |
|---|---|---|
| Data tools, admin, B2B | Flat/minimal, Swiss, border-led dark UI | Neumorphism, heavy glass, clay |
| Consumer apps | Material, soft flat with larger radii, selective glass | Brutalism (unless brand-led) |
| Developer tools | Minimal dark UI, neo-brutalism, Swiss | Skeuomorphism, clay |
| Creative, portfolio, indie | Neo-brutalism, Swiss, expressive gradients | Generic Material |
| Kids, playful brands | Claymorphism, bold color, pills | Swiss austerity |
| Media, entertainment | Dark UI, glass over imagery | Brutalism |

Decide with the user (SKILL.md, Step 2, and `direction.md`), not from what's trending.

## Flat / minimal

- **Implement:** solid fills, 1px borders or very light shadows, hierarchy carried by type and spacing, one accent color.
- **When:** almost always a safe base, especially for tools.
- **Fails when:** buttons become indistinguishable from text (ghost buttons everywhere), or "minimal" turns into "empty" with no hierarchy. Keep clear affordances: primary buttons have fills, inputs have visible 3:1 borders.

## Material

- **Implement:** tonal surface containers, state layers (8% hover, 12% pressed overlays), pill buttons, 12px cards, 28px dialogs, Material 3 color roles generated from a seed color, Roboto or a brand face.
- **When:** Android-adjacent products, cross-platform apps, teams that want a complete documented system.
- **Fails when:** used unbranded, which makes every app look like a Google template. Change the typeface, the seed color and some shape tokens.

## Skeuomorphism

- **Implement:** real-world materials (paper, metal, leather), lighting with highlights and shadows, physical metaphors (knobs, switches).
- **When:** music and audio tools, games, apps that mirror physical devices, deliberate retro branding.
- **Fails when:** textures add noise and file weight, metaphors stop matching behavior, or it doesn't scale to many screens. Use sparingly, in feature moments, on top of a flat system.

## Neumorphism (soft UI)

- **Implement:** element and background share one color; paired shadows create extrusion: `box-shadow: 6px 6px 12px var(--shade-dark), -6px -6px 12px var(--shade-light)`. Inset versions show "pressed".
- **When:** decorative accents, hero illustrations, single-purpose gadgets (a calculator, a thermostat), only with added contrast.
- **Fails when:** used for real controls. Boundaries come only from subtle shadows, which falls far below the 3:1 needed for UI components (SC 1.4.11). Pressed vs unpressed and focus states are hard to tell apart. **If you must:** add a visible border at 3:1, a strong focus ring and a non-shadow selected state (an accent fill).

## Glassmorphism and Apple Liquid Glass

- **Implement:**

```css
.glass {
  background: oklch(1 0 0 / 0.65);               /* dark: oklch(0.2 0.01 255 / 0.6) */
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid oklch(1 0 0 / 0.3);
  box-shadow: var(--shadow-lg);
}
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .glass { background: var(--surface-raised); backdrop-filter: none; }
}
```

- **When:** floating chrome over rich content: toolbars over maps or photos, media controls, navigation bars that hint at the content scrolling beneath.
- **Apple Liquid Glass (2025):** Apple's take adds lensing (refraction at the edges), light reacting to content and movement, and two variants: *regular* (adaptive, legible on most content) and *clear* (more transparent, only over visually rich media, with a dimming layer). The key rule: glass belongs to the **navigation and control layer**, floating above content, never on the content itself. Don't stack glass on glass.
- **Fails when:** the backdrop is unpredictable, so text contrast changes with whatever scrolls behind. Test against the worst-case backdrop (white, busy photo, pure color). Blur is expensive on low-end phones and on large areas. Glass cards on a plain background are just gray cards that cost more.

## Claymorphism

- **Implement:** large radii (20–32px), puffy 3-D feel from an outer soft shadow plus inner highlights (`inset 0 -8px 16px rgb(0 0 0 / .1), inset 0 8px 16px rgb(255 255 255 / .6)`), saturated pastel fills, rounded typography.
- **When:** playful consumer and kids' products, onboarding illustrations, landing pages.
- **Fails when:** applied to dense UI. Shapes eat space, and pastel fills with white text fail contrast. Use dark text on pastel fills.

## Neo-brutalism

- **Implement:** 2–3px solid black borders, hard offset shadows with no blur (`box-shadow: 4px 4px 0 #000`), flat saturated fills (yellow, pink, lime), heavy grotesque or monospace type, visible grid, small or zero radius. Pressed state: translate by the shadow offset and remove the shadow.
- **When:** indie products, developer tools, creative portfolios, brands that want to look unpolished on purpose.
- **Fails when:** saturated pairs clash and vibrate, contrast between fill and text is unchecked, or the style becomes a costume over a confusing layout. Raw style still needs rigorous spacing.

## Swiss / International style

- **Implement:** a strict column grid, asymmetric layouts, large grotesque type (Helvetica-like, Inter Display, Neue Haas-style faces) with tight tracking, generous whitespace, flush-left ragged-right text, few colors (black, white, one accent), photography or pure typography instead of illustration.
- **When:** editorial, data-heavy products, enterprise, design-led brands, documentation.
- **Fails when:** the typeface is weak or default, since type is the whole style. It can feel cold; warm it with one accent color and careful copy.

## Bento grid

- **Implement:** CSS grid with mixed cell spans (1×1, 2×1, 1×2, 2×2), uniform gap (12–24px), uniform radius, each cell one idea (a stat, a feature, a visual).

```css
.bento { display: grid; gap: 1rem; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 12rem; }
.bento .wide { grid-column: span 2; } .bento .tall { grid-row: span 2; }
@media (max-width: 767px) { .bento { grid-template-columns: 1fr; } .bento > * { grid-column: auto; grid-row: auto; } }
```

- **When:** feature overviews, dashboards with heterogeneous widgets, portfolio summaries.
- **Fails when:** it's the default for every landing page (it's now a recognizable template). Reading order for screen readers follows the DOM, not the visual grid, so order the DOM by importance. On mobile it collapses to a plain stack.

## Gradient / aurora

- **Implement:** a few large blurred radial gradients in OKLCH (keeps the midpoints from going gray), slow movement or none, a subtle grain overlay to prevent banding.
- **When:** marketing heroes, brand moments, backgrounds behind simple content.
- **Fails when:** text sits on the gradient with unchecked contrast, or it's the purple-to-blue gradient that signals "generated". If you use gradients, derive them from the brand hue and keep them behind content, not inside buttons and text.

## Dark UI

Rules are in `color.md` (dark mode is a separate design). As a primary style:
- **Implement:** near-black base (OKLCH L 0.14–0.18, tinted to the brand), tonal elevation, 1px translucent borders, desaturated accents, white text at slightly below full brightness for body text.
- **When:** media, pro creative tools, developer tools, products used in low light.
- **Fails when:** pure `#000` with pure white text (halation), saturated accents that vibrate, or shadows used as the only separation.

## Mixing styles

- **One base style plus at most one accent style.** Example: flat/minimal base with glass only on the floating toolbar. Or Swiss layout with brutalist buttons on the marketing site only.
- **Product UI and marketing site may differ** in expressiveness (Carbon's productive vs expressive split), but share tokens: type family, colors, radius family.
- **Never mix radius families or depth methods** inside one surface.
