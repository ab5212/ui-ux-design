# Typography

## Contents
- Beginner: the default scale and five rules
- Advanced: hierarchy, pairing, numbers, responsive type
- Expert: optical sizing, variable fonts, loading, internationalization

---

## Beginner: the default scale and five rules

| Token (Tailwind) | Size / line-height | Weight | Use |
|---|---|---|---|
| `text-xs` | 12 / 16 | 400–500 | Captions, timestamps, meta. Never body text |
| `text-sm` | 14 / 20 | 400–500 | Dense UI, table cells, labels, helper text |
| `text-base` | 16 / 24 | 400 | Body text, inputs, buttons on touch |
| `text-lg` | 18 / 28 | 400–500 | Lead paragraphs, emphasized body |
| `text-xl` | 20 / 28 | 600 | Card and dialog titles |
| `text-2xl` | 24 / 32 | 600 | Section headings |
| `text-3xl` | 30 / 36 | 600 | Page titles in apps |
| `text-4xl` | 36 / 40 | 600–700 | Page titles on marketing pages |
| `text-5xl` / `6xl` | 48 / 60, line-height 1.0–1.1 | 600–700 | Display, hero only |

The five rules:

1. **Body text is 16px with line-height 1.5.** Comfortable web body text sits between 15 and 25px. Never set inputs under 16px on mobile, or iOS Safari zooms the page when they get focus.
2. **Lines hold 45–90 characters.** Use `max-width: 65ch` (`max-w-[65ch]`) on prose. `ch` measures the width of a zero, so it only approximates line length; check by eye.
3. **Use two or three weights.** 400 for reading, 500 for UI labels, 600 for headings. 700+ only for display sizes. Every extra weight is another font download and another level of hierarchy to manage.
4. **Tighten line height as size grows.** Body 1.5, small headings 1.25–1.3, large headings 1.1–1.2, display 1.0–1.1.
5. **Build hierarchy with size and weight first, color second.** Gray text is for secondary content, not for making things "look subtle". `--muted-foreground` already passes 4.5:1; anything lighter fails.

## Advanced: hierarchy, pairing, numbers, responsive type

### Choosing a scale

| Ratio | Name | Best for |
|---|---|---|
| 1.125–1.2 | Major second / minor third | Dense apps, dashboards, many heading levels |
| 1.25 | Major third | Default for most products |
| 1.333 | Perfect fourth | Content sites, docs |
| 1.5–1.618 | Perfect fifth / golden | Marketing and editorial with few levels |

Apps need more levels in less space, so use small ratios. Landing pages need contrast between few levels, so use larger ones. Round results to whole pixels and keep line heights on the 4px grid (16, 20, 24, 28, 32…).

### How the major systems set type

- **Material 3:** 15 roles (display, headline, title, body, label × large/medium/small). Body large is 16, label medium is 12.
- **Apple HIG:** semantic text styles that scale with Dynamic Type. iOS body is 17pt; footnote 13; caption 12.
- **Carbon (IBM):** a productive scale for apps and an expressive one for marketing, set in IBM Plex.
- **Recommended:** use Tailwind's scale above, but define semantic aliases (`.text-title`, `.text-body`, `.text-label`) or component-level classes. Screens then refer to roles, and the scale can change in one place.

### Tracking (letter-spacing)

| Context | Value |
|---|---|
| Body text | 0 |
| Headings 24px and up | −0.01em to −0.02em |
| Display 48px and up | −0.02em to −0.03em |
| ALL CAPS labels (if used at all) | +0.04em to +0.08em |

Use all caps sparingly: short labels only, never for sentences, and never as the default treatment for every section label.

### Pairing

- **Safest:** one family with a wide weight range for everything.
- **Two families:** pair structural contrast, such as a serif or a strong grotesque for headings with a neutral sans for UI. Two similar sans-serif families look like a mistake.
- **Monospace** is for code, IDs and keys, not as decoration for small labels.
- Pick a typeface that suits the product, not the default. The system stack in `tokens.css` is a safe fallback, not a brand decision. A typeface with character (a humanist sans for warmth, a geometric face for precision, a serif for authority) does more for identity than any color choice.

### Numbers

```css
.numeric { font-variant-numeric: tabular-nums lining-nums; }
```

- Use tabular figures in tables, prices, timers, counters and any column that is compared vertically. Right-align them.
- Format numbers for the locale with `Intl.NumberFormat`, never with string concatenation.
- Show units in a smaller or muted style: "**1,284** users", "**$49** /month".

### Responsive type

- Keep body text fixed at 1rem. Fluid body text breaks user zoom (WCAG 1.4.4) and gains little.
- Make only display and page titles fluid, with `clamp()` using rem plus vw so zoom still works:

```css
.display { font-size: clamp(2.25rem, 1.5rem + 3vw, 3.75rem); line-height: 1.05; }
```

- On compact screens, step headings down one level (`text-3xl` → `text-2xl`) rather than shrinking everything proportionally.
- Use `text-wrap: balance` on headings (up to about 6 lines) and `text-wrap: pretty` on paragraphs to avoid one-word last lines.

### Truncation

- Truncate only text that has another place to be read in full (a tooltip, a detail page). Never truncate prices, error messages or the only label of a control.
- Single line: `truncate` (`overflow-hidden text-ellipsis whitespace-nowrap`) needs a width-constrained parent; in flex layouts add `min-w-0` on the flex child.
- Multi-line: `line-clamp-2`.
- Long unbroken strings (URLs, emails, IDs) need `overflow-wrap: anywhere` (`wrap-anywhere`) or they force horizontal scrolling on mobile.

## Expert: optical sizing, variable fonts, loading, internationalization

### Variable fonts

One variable font file often costs less than three static weights. Use intermediate weights (450, 550) for fine hierarchy, and `font-optical-sizing: auto` when the font has an `opsz` axis, so small text gets sturdier letterforms.

### Loading without layout shift

- Self-host fonts (`@fontsource` packages or files in `/public`). Third-party font hosts add a connection and privacy questions.
- Use `font-display: swap` and preload the one or two files above the fold.
- Reduce the jump when the web font replaces the fallback by tuning the fallback with `size-adjust`, `ascent-override` and `descent-override`. Next.js `next/font` and Fontaine do this automatically.
- Subset to the scripts you actually ship.

### Internationalization

- Plan for 30–40% text expansion (German, Finnish) in buttons, tabs and navigation. Never give text containers fixed widths.
- CJK text needs a larger line height (1.7–1.8) and never italics. Many CJK fonts have no italic, so the browser fakes one.
- Arabic and Hebrew are right-to-left. Use logical properties (`ms-`, `me-`, `ps-`, `pe-`, `text-start`) and test with `dir="rtl"` on `<html>`.
- Fall back per script in the stack: `font-family: "Brand Sans", "Noto Sans JP", "Noto Sans Arabic", system-ui, sans-serif`.
- Use `lang` attributes so screen readers pronounce text correctly and the browser hyphenates it correctly (`hyphens: auto` needs `lang`).
