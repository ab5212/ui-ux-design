# Components: overlays and messages

Dialog (modal), alert dialog, drawer and sheet, popover, tooltip, toast, alert and banner.

## Contents
- Choosing the right overlay
- Dialog
- Alert dialog (confirmations)
- Drawer and bottom sheet
- Popover
- Tooltip
- Toast / snackbar
- Alert and banner
- Implementation: native top layer vs libraries

---

## Choosing the right overlay

| Need | Use | Blocks the page? |
|---|---|---|
| Focused task the user must finish or cancel (create, edit, confirm) | Dialog | Yes |
| Confirm an irreversible action | Alert dialog | Yes |
| Secondary task with context still visible (filters, details, settings) | Drawer / side sheet | Usually not on desktop |
| Mobile version of a dialog or menu | Bottom sheet | Yes |
| Small interactive content anchored to a trigger (pickers, mini forms) | Popover | No |
| Short, non-essential label for an element | Tooltip | No |
| Brief confirmation of something that happened | Toast | No |
| Persistent message about a page or section's state | Inline alert / banner | No |

**Prefer no overlay.** Inline editing, expanding sections and separate pages often beat a dialog. Never open a dialog on page load (except legally required consent), and never stack dialogs on dialogs.

## Dialog

| Spec | Value |
|---|---|
| Width | sm 400–480, md 560–640, lg 800, plus `w-[calc(100%-2rem)]` so there's a margin on mobile |
| Max height | `max-h-[85dvh]`; header and footer fixed, body scrolls |
| Padding | 24px (16 on compact) |
| Radius | `rounded-2xl` (16) |
| Elevation | `shadow-xl`, `bg-surface-raised` |
| Scrim | `bg-black/50` (light) or `/70` (dark), optional 4px backdrop blur |
| Anatomy | Title (required, `text-lg font-semibold`), optional description, body, footer with actions at the end, close button (×) top-right |
| Enter motion | Fade + scale 0.96 → 1 (or translateY 8px → 0), 200ms decelerate; exit 150ms accelerate |
| Compact screens | Full-screen for forms, bottom sheet for short content |

**Behavior (WAI-ARIA dialog pattern):**
- `role="dialog"` with `aria-modal="true"` and `aria-labelledby` pointing at the title (`aria-describedby` for the description).
- On open: focus moves into the dialog, to the first field or the least destructive action. Not to the × button unless nothing else is focusable.
- Tab and Shift+Tab cycle inside the dialog; the page behind is inert (`inert` attribute or the native modal dialog).
- Esc closes, unless closing loses unsaved work; then confirm first.
- On close: focus returns to the element that opened it.
- Clicking the scrim closes simple dialogs. For forms with input, don't close on scrim click: an accidental click loses work.
- Lock background scroll while open (`overflow: hidden` on `<html>`, with scrollbar-gutter compensation to avoid a layout jump).

```html
<!-- Native: focus trap, Esc, inert background and top layer all built in -->
<dialog id="edit" aria-labelledby="edit-title" class="…">
  <h2 id="edit-title">Edit project</h2>
  …
  <form method="dialog"><button>Cancel</button></form>
</dialog>
<script>document.getElementById("edit").showModal();</script>
```

## Alert dialog (confirmations)

Use `role="alertdialog"` for "Delete 3 files?" style confirmations.

- **Title names the action and object:** "Delete 'Q3 report'?", not "Are you sure?"
- **Body states the consequence:** "This can't be undone. The report will be removed for everyone on the team."
- **Buttons repeat the verb:** "Delete report" and "Cancel". Not "OK" / "Yes".
- **Initial focus on Cancel** for destructive actions.
- For high-stakes deletes (a whole project, an account), require typing the name.
- **Prefer undo over confirmation** for frequent, recoverable actions: delete immediately, then show a toast with "Undo" for 5–10s. Confirmation dialogs that appear every time get clicked through without reading.

## Drawer and bottom sheet

| | Side drawer | Bottom sheet |
|---|---|---|
| Size | 320–480px wide, full height | Full width, max-height 90dvh, `rounded-t-2xl` |
| Entry | Slides from the end edge (right in LTR), 250–300ms decelerate | Slides up, 250–300ms |
| Use | Filters, detail inspector, settings, mobile navigation (from the start edge) | Mobile dialogs, menus, pickers |
| Modal? | Modal on compact; can be non-modal (pushes content) on expanded | Modal |

- A drag handle (36×4px pill) on bottom sheets signals swipe-to-dismiss. Also provide a close button, because swiping isn't discoverable or accessible.
- Apply the bottom safe-area inset inside sheets.
- Non-modal drawers don't trap focus, but must be reachable by keyboard and closable with Esc while focus is inside.

## Popover

- Anchored to its trigger and placed automatically (flips to stay in view). Floating UI, Radix Popover or the native `popover` attribute with CSS anchor positioning (where supported).
- `rounded-lg`, `shadow-md`, `bg-surface-raised`, 12–16px padding, max-width about 320px.
- The trigger has `aria-expanded` and `aria-controls`. Esc closes and returns focus to the trigger; clicking outside closes it.
- It may contain interactive content (unlike a tooltip). If it contains a form, focus moves into it.
- A 4–8px offset from the trigger. Arrows are optional; if used, keep them small (8px) and in the same color as the panel.

## Tooltip

| Spec | Value |
|---|---|
| Content | Short plain text, 1–2 lines, no links or buttons |
| Style | `text-xs` or `text-sm`, `bg-foreground text-background` (inverted), `rounded-sm`, 6×8px padding, max-width 240px |
| Delay | About 500ms open delay; close after about 100ms; once one is open, adjacent ones open instantly |
| Triggers | Hover **and** keyboard focus; Esc dismisses (WCAG 1.4.13) |
| Hover persistence | The pointer can move onto the tooltip without it closing |
| Semantics | `role="tooltip"`, trigger references it with `aria-describedby` (or the tooltip text *is* the `aria-label` of an icon button) |

**Tooltips don't exist on touch.** Never put essential information (error explanations, required instructions, prices) only in a tooltip. Show it inline, or use a tap-to-open popover with an info button.

## Toast / snackbar

| Spec | Value |
|---|---|
| Position | Bottom-center on compact (above bottom navigation); bottom-right or top-right on expanded. One position per product |
| Width | Full width minus 16px margins on compact; 320–420px on expanded |
| Duration | 4–6s for short text (add about 1s per extra 10 words); errors and toasts with actions stay until dismissed |
| Content | One line of text, optional single action ("Undo", "View"), close button |
| Stack | Max 3 visible; newer on top (or bottom), older collapse |
| Motion | Slide + fade in from the nearest edge, 200ms; respect reduced motion |

- Announce with `role="status"` (polite). Use `role="alert"` (assertive) only for urgent failures.
- Pause the timer on hover and on keyboard focus. Make toasts reachable by keyboard, with a shortcut (e.g. F8) if they hold actions.
- **Never put the only path to an action in a toast.** It disappears, and screen-reader users may miss it. "Undo" in a toast is fine because undo also exists elsewhere (or is a bonus).
- Don't toast things the user can already see change ("Item added" when the item visibly appears).
- Don't use toasts for form validation errors. Errors go next to the fields.

## Alert and banner

| Type | Scope | Persistence |
|---|---|---|
| Inline alert | A section or form ("3 fields need attention") | Until the condition changes |
| Page banner | The whole page or app ("Your trial ends in 3 days", "Service degraded") | Until dismissed or resolved |
| System banner | Global, top of the viewport (maintenance, offline) | Until resolved |

- Anatomy: status icon + title (optional) + message + optional action + optional dismiss. Use the status color as a tint background (`bg-destructive/10`) with a status-colored icon and a left border or outline. Body text stays `--foreground` for contrast.
- `role="alert"` only for messages that appear dynamically and need immediate attention; static alerts present on page load need no role.
- Dismissed banners stay dismissed (store it), and come back only if the condition changes.
- Don't stack more than one global banner. Prioritize.

## Implementation: native top layer vs libraries

| Option | Pros | Cons |
|---|---|---|
| `<dialog>` + `showModal()` | Focus trap, Esc, inert background, top layer, no z-index; zero dependencies | Exit animations need `@starting-style`/`transition-behavior: allow-discrete` (modern browsers), or JavaScript |
| `popover` attribute | Light dismiss, top layer, no JavaScript for open/close | Anchoring needs CSS anchor positioning (not universal) or Floating UI |
| Radix / React Aria / Headless UI | Complete keyboard and ARIA behavior, positioning, animation hooks, tested on screen readers | Dependency; must be styled |

Recommended: use the project's existing primitives library. Without one, use Radix (React) or the native elements (any framework). Don't hand-roll focus traps.
