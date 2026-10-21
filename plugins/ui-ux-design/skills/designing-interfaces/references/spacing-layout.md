# Spacing and layout

## Contents
- Beginner: the scale and the proximity rule
- Advanced: component padding, grids, page structure, alignment, density
- Expert: intrinsic layout, optical adjustment, rhythm

---

## Beginner: the scale and the proximity rule

Use a 4px base unit. Every margin, padding, gap and fixed size comes from this scale:

| px | Tailwind | Typical use |
|---|---|---|
| 2 | `0.5` | Hairline gaps, icon-to-badge offset |
| 4 | `1` | Icon-to-text in tight UI, chip internal gap |
| 8 | `2` | Icon-to-label in buttons, gap between related inline items |
| 12 | `3` | Padding in compact controls, gap in form rows |
| 16 | `4` | Card padding on mobile, gap between form fields |
| 20 | `5` | Rarely needed; between 16 and 24 |
| 24 | `6` | Card and dialog padding, gap between groups |
| 32 | `8` | Gap between sections inside a page |
| 40–48 | `10`–`12` | Section padding on mobile |
| 64–96 | `16`–`24` | Section padding on desktop, hero spacing |

Avoid off-scale values (13px, 18px, 22px). They are the clearest sign of eyeballed spacing.

### The proximity rule

**Space inside a group must be clearly smaller than space between groups.** This is how users see structure without borders. Use a ratio of about 1:2 or more:

```
Label        ← 6–8px →  Input
Input        ← 16px  →  next field (same group)
Last field   ← 32px  →  next section heading
```

If everything is evenly spaced, nothing looks related, and you'll be tempted to add boxes and dividers to fix it. Fix the spacing instead.

## Advanced: component padding, grids, page structure, alignment, density

### Component padding

| Component | Padding |
|---|---|
| Button sm / md / lg | 12 / 16 / 20–24px horizontal |
| Input | 12px horizontal (plus icon width when there's an icon) |
| Card | 16px on compact screens, 24px on larger ones |
| Dialog | 24px; 16px on compact |
| Table cell | 12–16px horizontal, height from `--row-h` |
| Page gutter (edge margin) | 16px compact, 24px medium, 32px+ expanded |

Vertical padding of a single-line control is (height − line-height) / 2. Set the height and let flexbox center the content; don't stack padding on top of a fixed height.

### Grids

| Width class | Columns | Gutter | Margin |
|---|---|---|---|
| Compact (<640) | 4 | 16 | 16 |
| Medium (640–1023) | 8 | 16–24 | 24 |
| Expanded (1024+) | 12 | 24–32 | 32+ or centered max-width |

In practice most app layouts don't need a formal column grid. Use CSS grid with named areas for the page shell, and flex or auto-fit grids for content:

```css
/* Responsive card grid with no breakpoints: columns appear as space allows */
.cards { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fill, minmax(min(18rem, 100%), 1fr)); }
```

The `min(18rem, 100%)` keeps a single card from overflowing on very narrow screens.

### Page structure

- **Reading content:** max-width about 680px (65–75ch), centered.
- **Forms:** max-width 480–640px. A full-width text field on a 1440px screen is hard to scan and looks broken.
- **App content area:** fluid up to 1200–1440px, then centered or filled by extra panes (see `responsive.md`).
- **Marketing pages:** full-bleed section backgrounds with a centered content container.

```html
<main class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">…</main>
```

### Alignment

- Pick a few strong vertical edges and align everything to them. Left-aligned text in left-to-right languages, with headings aligned to the body text edge.
- Center-align only short, single-purpose content: empty states, hero headlines, confirmation screens. Never center paragraphs or forms.
- Align numbers right, text left. Table headers align with their column content.
- Align icons to the cap height or center of the first line of text, not the center of a multi-line block.

### Density in layout

Density modes (see `tokens.md`) change control and row heights. Layout spacing should follow: in compact mode, reduce section gaps one step on the scale (32 → 24), but keep page gutters.

## Expert: intrinsic layout, optical adjustment, rhythm

### Intrinsic layout

Prefer layouts that respond to their content and container over fixed breakpoints:

- `flex-wrap` with a `gap` for toolbars and tag lists.
- `grid-template-columns: repeat(auto-fit, minmax(...))` for galleries.
- `clamp()` for padding that scales: `padding-inline: clamp(1rem, 4vw, 3rem)`.
- Container queries for components placed in slots of unknown width (see `responsive.md`).
- `min-w-0` on flex and grid children that contain text. Without it, long content forces the parent wider than the screen. This is the most common cause of mobile horizontal scrolling.

### Optical adjustment

Geometry and perception differ. Adjust when it looks off, even if the math is "right":

- A play triangle centered by its bounding box looks left-heavy. Shift it about 1–2px right.
- Round shapes (avatars, circular icons) look smaller than squares of the same size. Make them about 5–10% larger.
- Text in a button looks low because of descender space. Many fonts need 1px less top padding, or use `text-box-trim` where supported.
- Icon padding: an icon button with a 20px icon in a 40px box is a 10px inset. Icons drawn to a 24px grid with a 2px safe zone may need a 1px nudge.

### Vertical rhythm

Keep line heights and block spacing on the 4px grid so baselines stay aligned across columns. Don't try to enforce a strict baseline grid in browser UI; it fights with images and components and buys little. Consistent spacing tokens give 90% of the benefit.
