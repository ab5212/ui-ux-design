# Components: actions

Buttons, icon buttons, links, button groups, dropdown menus, command palette.

## Contents
- Button: hierarchy, sizes, anatomy, states, code
- Icon button
- Link vs button
- Button groups and placement
- Dropdown menu
- Command palette

---

## Button

### Hierarchy (pick by importance, not by looks)

| Variant | Look | Use | Per view |
|---|---|---|---|
| Primary | `bg-primary text-primary-foreground` | The single most important action | **One** per view or region |
| Secondary | `bg-secondary` or 1px `--input` outline | Alternative actions (Cancel, Export) | A few |
| Tertiary / ghost | Text only, `hover:bg-accent` | Low-emphasis actions in toolbars and cards | Many |
| Destructive | `bg-destructive text-destructive-foreground` | Irreversible removal, usually in a confirmation step | Rare |
| Link | Underlined text | Inline navigation inside text | Any |

A page with three primary buttons has no primary button. If two actions compete, the less important one becomes secondary.

### Sizes

| Size | Height | Padding-x | Font | Icon | Gap | Use |
|---|---|---|---|---|---|---|
| sm | 32 | 12 | 14 | 16 | 6 | Dense tables, toolbars, compact density |
| md | 40 | 16 | 14 (16 on touch) | 16–20 | 8 | **Default** |
| lg | 48 | 20–24 | 16 | 20 | 8 | Touch-first, marketing calls to action, mobile primary |

Carbon uses 32/40/48 (plus 24/64/80); Primer uses 28/32/40. On touch layouts make sure the hit area reaches 44px even for sm buttons (pad the hit area, not the visuals).

### Anatomy

`[leading icon] Label [trailing icon or count]`. Label: verb + object, sentence case, 1–3 words ("Create project", not "Submit" or "CREATE"). Leading icons reinforce meaning; a trailing chevron means "opens a menu"; a trailing arrow means "goes somewhere". Don't add arrows to every button.

### States

| State | Treatment |
|---|---|
| Hover | Fill darkens about 6% (or 8% overlay); cursor stays `default` (buttons) or `pointer` (consistent per product) |
| Focus-visible | 2px `--ring` outline, 2px offset |
| Active | Fill darkens 10–12%; optional `scale(0.98)` with 70ms transition |
| Disabled | 50% opacity, no hover, `disabled` attribute. If users won't know *why* it's disabled, keep it enabled and explain on click, or add helper text |
| Loading | Keep the width, replace or prefix the label with a spinner, set `aria-busy="true"` and `disabled` to prevent double submission. Keep the label for screen readers: "Saving…" |

### Code (React + Tailwind v4 + cva)

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium " +
    "transition-[background-color,color,box-shadow,transform] duration-(--duration-fast) ease-(--ease-standard) " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring " +
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-surface hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "h-auto px-0 text-primary underline underline-offset-4 hover:decoration-2",
      },
      size: {
        sm: "h-(--control-h-sm) px-3 text-sm",
        md: "h-(--control-h-md) px-4 text-sm",
        lg: "h-(--control-h-lg) px-6 text-base [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { loading?: boolean };

export function Button({ className, variant, size, loading, disabled, children, ...props }: Props) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {children}
    </button>
  );
}
```

Always set `type="button"` on buttons inside forms that don't submit; the HTML default is `submit`.

## Icon button

- Square: 32 / 40 / 48 matching the button sizes; icon 16 / 20 / 20–24.
- **Must** have an accessible name: `aria-label="Delete row"`. Add a tooltip with the same text for sighted mouse users.
- Use only for universally understood icons (close, search, more, edit, delete, menu). Anything else gets a text label, or icon plus label.
- Toggle icon buttons (bold, mute, favorite) use `aria-pressed="true|false"` and change the icon fill.

## Link vs button

| If it… | Use |
|---|---|
| Navigates to a URL (another page, anchor, download) | `<a href>`, even if it looks like a button |
| Performs an action on this page (submit, open dialog, toggle) | `<button>` |

Never `<div onClick>`. Never `<a>` without `href`. Links in body text are underlined: color alone fails for colorblind users unless contrast with surrounding text is 3:1 *and* there's a non-color cue on hover and focus. External links that open new tabs say so ("opens in new tab", or an icon with that accessible text).

## Button groups and placement

- **Dialogs and forms:** primary action at the end of the reading direction (right in LTR), secondary to its left. Destructive dialogs: put the destructive action on the right, but make "Cancel" the default focus.
- **Mobile:** stack full-width buttons; primary on top in content flow, or in a sticky bottom bar near the thumb.
- **Spacing:** 8px between buttons in a group; 12–16px from the last field.
- **Segmented control** (2–5 mutually exclusive options that switch a view): a `role="radiogroup"` with radio semantics, or a tablist if it switches panels. The container uses the outer radius, and segments use outer − padding.
- **Split button:** primary action plus a chevron menu for variants ("Save" / "Save as…"). Both halves are separate buttons with separate labels.

## Dropdown menu

For **actions** (Edit, Duplicate, Delete), not for navigation and not for choosing a form value (use a select for that).

| Spec | Value |
|---|---|
| Trigger | Button with `aria-haspopup="menu"`, `aria-expanded`, chevron or "more" icon |
| Panel | `rounded-lg`, `shadow-md`, `bg-surface-raised`, 4px inner padding, min-width 180px, max-height with scroll |
| Items | 32–36px tall (40 on touch), 8–12px horizontal padding, inner radius = panel radius − 4px |
| Groups | Separators or small group headings; destructive item last, in destructive color |
| Extras | Left icons (optional, consistent), right-aligned shortcuts in `text-muted-foreground` |

Keyboard (WAI-ARIA menu button pattern):
- Enter, Space or ↓ opens the menu and focuses the first item; ↑ focuses the last.
- ↑/↓ move between items; Home/End jump; typing a letter jumps to the matching item.
- Enter activates; Esc closes and returns focus to the trigger; Tab closes and moves on.

Use Radix `DropdownMenu`, Headless UI `Menu` or React Aria `Menu` rather than hand-building this.

On compact screens, long menus (more than about 7 items) open as a bottom sheet.

## Command palette

For power users in apps with many actions or destinations.

- Open with ⌘K (Mac) / Ctrl+K (others), plus a visible trigger (a search-looking button showing the shortcut).
- A centered dialog at the top third of the screen, 560–640px wide, input at the top, results below.
- Fuzzy matching, grouped results (Recent, Pages, Actions), keyboard shortcuts shown on the right.
- Combobox + listbox semantics: focus stays in the input, ↑/↓ move `aria-activedescendant`, Enter runs the action, Esc closes.
- Show recent items on open, so the empty state is useful.
- Libraries: `cmdk`, or a combobox from React Aria or Headless UI.
