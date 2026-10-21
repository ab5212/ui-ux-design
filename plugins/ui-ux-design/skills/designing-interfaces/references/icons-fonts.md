# Icons and fonts

Rule: every UI built with this skill uses **Google Fonts** (https://fonts.google.com) for type and **Material Symbols** (https://fonts.google.com/icons) for icons. Do not use Lucide, Heroicons, Font Awesome, emoji or hand-drawn SVG icons. Offer the user a choice among Google Fonts and Material Symbols styles; never another source.

## Fonts

Offer two or three Google Fonts that fit the chosen style, recommended first:

| Look | Heading / body | Mono |
|---|---|---|
| Clean, minimal (default) | Inter | Roboto Mono |
| Soft, friendly | Nunito, DM Sans | Roboto Mono |
| Modern product | Manrope, Plus Jakarta Sans | JetBrains Mono |
| Editorial | Playfair Display or Source Serif 4 + Inter | Roboto Mono |
| Bold, raw | Space Grotesk, Archivo | Space Mono |

Load only the families and weights used. Use a variable font range (`wght@400..700`) and `display=swap`.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&display=swap">
```

Set the family in the token: `--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;`. Keep the generic fallback. For privacy or offline use, download the same files from fonts.google.com and self-host them with `@font-face`.

## Icons

Load Material Symbols once. Pick one style for the whole product: Rounded (friendly default), Outlined (neutral) or Sharp (strict). Use `display=block` so the icon name never flashes as text.

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0..1,0&display=block">
```

```html
<span class="material-symbols-rounded" aria-hidden="true">add</span> New project
```

```css
.material-symbols-rounded { font-size: 1.25rem; line-height: 1; width: 1em; height: 1em; overflow: hidden; flex-shrink: 0; user-select: none; }
.material-symbols-rounded.filled { font-variation-settings: "FILL" 1; } /* active nav item, toggled-on state */
```

- Size with `font-size` (16, 20 or 24px). One weight for the whole product.
- Decorative icon: `aria-hidden="true"` and a visible label. Icon-only button: put `aria-label` on the `<button>`, never on the icon.
- Icon color follows `currentColor`, so text color tokens apply. Icons need 3:1 contrast.
- React, Vue, Svelte, Angular: render the same `<span>`. A tiny `<Icon name="add" />` component is enough; no icon package needed. Angular Material users can use `<mat-icon>`.
- Common names: `add`, `close`, `search`, `menu`, `more_horiz`, `edit`, `delete`, `content_copy`, `download`, `settings`, `home`, `notifications`, `group`, `chevron_left`, `chevron_right`, `expand_more`, `check_circle`, `error`, `warning`, `info`. Look up others at https://fonts.google.com/icons.
