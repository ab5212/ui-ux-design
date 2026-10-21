# Design tokens

## Contents
- Beginner: what tokens are and the minimum set
- Advanced: three tiers, naming, theming, density
- Mapping by stack: Tailwind v4, Tailwind v3, plain CSS, shadcn/ui, MUI, Chakra/Mantine
- Expert: DTCG JSON, multi-brand, migration from hardcoded styles

---

## Beginner: what tokens are and the minimum set

A token is a named design decision. Components refer to the name, never the value. You can then change the theme, the brand, dark mode or density by editing one file.

```css
/* Wrong: the decision is buried in the component */
.button { background: #2f5bd3; border-radius: 6px; height: 40px; }

/* Right: the component points at decisions */
.button { background: var(--primary); border-radius: var(--radius-md); height: var(--control-h-md); }
```

The minimum set every project needs:

| Group | Tokens |
|---|---|
| Surfaces | `--background`, `--foreground`, `--surface`, `--surface-raised`, `--muted`, `--muted-foreground` |
| Actions | `--primary`, `--secondary`, `--accent`, each with a matching `-foreground` |
| Status | `--destructive`, `--success`, `--warning`, `--info`, each with `-foreground` |
| Lines | `--border` (decorative), `--input` (control edge, 3:1), `--ring` (focus, 3:1) |
| Shape | `--radius` plus a derived scale |
| Depth | `--shadow-xs` … `--shadow-xl` |
| Size | `--control-h-sm/md/lg`, `--row-h`, `--target-min` |
| Motion | `--duration-*`, `--ease-*` |
| Layers | `--z-dropdown` … `--z-tooltip` |
| Type | `--font-sans`, `--font-mono` (sizes come from the Tailwind scale or `--text-*`) |

`assets/tokens.css` contains all of these, tuned and contrast-checked. Copy it when the project has nothing.

**The foreground rule:** every fill color has a partner for the text that sits on it. `bg-primary` always pairs with `text-primary-foreground`, never with `text-white`. That is what keeps dark mode and rebrands from breaking.

## Advanced: three tiers, naming, theming, density

### Three tiers

| Tier | Example | Who uses it |
|---|---|---|
| Primitive (raw palette) | `--blue-600: oklch(0.5 0.16 255)` | Only the semantic tier |
| Semantic (meaning) | `--primary`, `--muted-foreground`, `--radius-lg` | All components |
| Component (local) | `--button-h`, `--dialog-max-w` | One component, for overrides |

Small projects can skip primitives and write OKLCH values straight into semantic tokens; `assets/tokens.css` does this. Add a primitive tier when you need more than one brand or a published palette.

### Naming

- Name tokens by role, not appearance: `--destructive`, not `--red`.
- Use the pattern `category-role-variant-state`: `--color-text-muted`, `--color-bg-primary-hover`. Pick one pattern and never mix.
- Keep `-foreground` pairs next to their fills in the file so reviewers spot missing partners.

### Theming

Theme by swapping variable values under a selector. Components never change.

```css
:root { --primary: oklch(0.5 0.16 255); }
.dark { --primary: oklch(0.76 0.12 255); }
[data-brand="acme"] { --brand-h: 150; }
```

Toggle dark mode with a `dark` class on `<html>`, so users can override the OS. Initialize it before first paint to avoid a flash:

```html
<script>
  const t = localStorage.getItem("theme");
  if (t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches))
    document.documentElement.classList.add("dark");
</script>
```

Also set `color-scheme: light` / `dark` (included in `tokens.css`) so native scrollbars, form controls and autofill follow the theme.

### Density

Density changes heights and padding, not font size. Use a `data-density` attribute on `<html>` or on a region (a dense table inside a comfortable page):

| Mode | Control height md | Row height | When |
|---|---|---|---|
| compact | 32 | 32 | Data tools, admin, expert daily use |
| default | 40 | 40 | Most apps |
| comfortable | 48 | 48 | Consumer, touch-first, low-frequency use |

Never go below 14px text or 24px targets to gain density.

## Mapping by stack

### Tailwind v4 (CSS-first, no config file)

Put raw values in `:root` and `.dark`, then expose them with `@theme inline`. The `inline` keyword makes utilities reference your variable at runtime. Without it, class-based dark mode and data-attribute themes stop switching.

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
:root { --primary: oklch(0.5 0.16 255); }
.dark { --primary: oklch(0.76 0.12 255); }
@theme inline { --color-primary: var(--primary); }
```

Now `bg-primary`, `text-primary` and `ring-primary` exist and switch with the theme. Spacing comes from one variable, `--spacing` (default `0.25rem`, so `p-4` = 16px). Leave it at 4px.

Use arbitrary values with variables when needed: `h-(--control-h-md)`, `rounded-(--radius)`, `duration-(--duration-base)`.

### Tailwind v3 (`tailwind.config.js`)

```js
export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        border: "var(--border)", input: "var(--input)", ring: "var(--ring)",
      },
      borderRadius: { sm: "calc(var(--radius) * .5)", md: "calc(var(--radius) * .75)", lg: "var(--radius)", xl: "calc(var(--radius) * 1.5)" },
      boxShadow: { sm: "var(--shadow-sm)", md: "var(--shadow-md)", lg: "var(--shadow-lg)" },
    },
  },
};
```

Keep the `:root`/`.dark` blocks from `tokens.css` in the global CSS and delete its Tailwind v4 lines (`@import`, `@custom-variant`, `@theme`). Note: v3's `hover:` applies on touch devices too; see `responsive.md` for the fix.

### Plain CSS, CSS Modules, Sass, styled-components

Use the `:root`/`.dark` blocks as they are. Reference them with `var(--token)` everywhere. In Sass, don't convert tokens to `$variables`, because Sass variables can't change at runtime. Wrap them if you want autocomplete: `$primary: var(--primary);`.

### shadcn/ui

shadcn already uses this exact naming (`--background`, `--primary`, `--primary-foreground`, `--radius`, `@theme inline`). Merge rather than replace:

1. Keep the project's variable names.
2. Paste the OKLCH values from `tokens.css` over theirs if the user wants these defaults.
3. Add the tokens shadcn lacks: `--surface`, `--surface-raised`, `--success`, `--warning`, `--info`, `--control-h-*`, `--duration-*`, `--z-*`.

### MUI

Map tokens into `createTheme` with CSS variables enabled (`cssVariables: true`). Set `palette.primary.main` and `palette.primary.contrastText` from your tokens, `shape.borderRadius` = 8, `typography.fontSize` = 14 (MUI's default base; body1 renders at 16). Set `spacing` to 4 only if starting fresh: MUI's default is 8, and changing it breaks existing `sx={{ p: 2 }}` values.

### Chakra, Mantine and others

These have theme objects. Put semantic names in the theme (`colors.primary`, `radii.md`) and point them at CSS variables so dark mode stays a variable swap.

## Expert: DTCG JSON, multi-brand, migration

### DTCG JSON

If tokens must sync with Figma, iOS or Android, keep a source file in the W3C Design Tokens Community Group format and generate CSS with Style Dictionary or Terrazzo:

```json
{
  "color": {
    "primary": { "$type": "color", "$value": "oklch(0.5 0.16 255)" },
    "primary-foreground": { "$type": "color", "$value": "oklch(0.99 0 0)" }
  },
  "radius": { "lg": { "$type": "dimension", "$value": "8px" } }
}
```

For web-only projects, CSS is the source of truth. A JSON pipeline adds build steps without benefit.

### Multi-brand

Put brand differences in the primitive tier (hue, typeface, radius base) and keep semantic names identical. `--brand-h` in `tokens.css` is the smallest version of this: one number rebrands every OKLCH token, because lightness and chroma were tuned for contrast independently of hue. Re-run `scripts/check-contrast.mjs` after any hue change. Yellow and cyan hues at the same lightness read lighter and can fail.

### Migrating a codebase with hardcoded styles

1. Grep for raw values (`#[0-9a-f]{3,6}`, `rgb(`, `px` inside radius and shadow declarations).
2. Cluster the near-duplicates (`#2f5bd3`, `#2e5ad1`, `#3060d8` are one blue) and map each cluster to a semantic token.
3. Replace by meaning, not value. The same hex can be `--primary` in one place and `--ring` in another.
4. Migrate one component family per pull request. Screenshot before and after.
5. Add a lint rule (Stylelint `color-no-hex`, or a custom ESLint rule for Tailwind arbitrary colors) so new hardcoded values fail CI.
