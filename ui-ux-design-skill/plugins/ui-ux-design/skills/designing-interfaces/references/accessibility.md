# Accessibility (WCAG 2.2 AA as the floor)

## Contents
- Beginner: the ten checks that catch most problems
- Advanced: focus management, keyboard patterns, ARIA, live regions, forms
- WCAG 2.2 criteria developers most often miss
- User preference media queries
- Expert: screen reader testing, forced colors, cognitive accessibility
- Testing workflow

---

## Beginner: the ten checks that catch most problems

1. **Keyboard only:** unplug the mouse. Can you reach, operate and leave every control with Tab, Shift+Tab, Enter, Space, arrows and Esc? Is the focus always visible?
2. **Semantic HTML:** buttons are `<button>`, links are `<a href>`, form fields have `<label>`, headings are `<h1>`–`<h6>` in order, lists are lists, tables are tables.
3. **Accessible names:** every icon button, input and image has a name: visible text, `aria-label`, `alt` or `<label>`.
4. **Contrast:** text 4.5:1 (large text 3:1); control boundaries, icons and focus rings 3:1. Run `scripts/check-contrast.mjs`.
5. **Not color alone:** errors, statuses, links and chart series have a second cue.
6. **Zoom and reflow:** usable at 200% zoom, and no horizontal scroll at 320px wide.
7. **Targets:** at least 24×24px (44 on touch layouts).
8. **Images:** meaningful `alt`; decorative images get `alt=""`; text in images is avoided.
9. **Motion:** `prefers-reduced-motion` honored; nothing flashes; auto-moving content can be paused.
10. **Page structure:** a `lang` attribute on `<html>`, a unique `<title>`, landmarks (`header`, `nav`, `main`, `footer`), a skip link.

## Advanced: focus management, keyboard patterns, ARIA, live regions, forms

### Focus

- **Style:** `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }`. Use outline, not box-shadow: outlines survive forced-colors mode and don't get clipped as easily. Give the ring a radius that matches the element (outlines follow `border-radius` in modern browsers).
- **On colored or image backgrounds**, use a two-tone ring (outline in `--ring` plus an inner `box-shadow` in the background color) so it passes 3:1 everywhere. GOV.UK's yellow-and-black focus style is the reference for "visible on anything".
- **Order follows visual order.** Never use a positive `tabindex`. Fix the DOM order instead of reordering with CSS (`order`, `flex-direction: row-reverse` and grid placement can break the match).
- **Move focus deliberately:**
  - Opening a dialog → focus into the dialog.
  - Closing a dialog → back to its trigger.
  - Deleting an item → to the next item, or to the list heading.
  - Route change in an SPA → the new page's `<h1>` (`tabindex="-1"`).
  - Form submit with errors → the error summary or first invalid field.
- **Never trap focus** except inside modal dialogs.
- **`inert`** on everything outside an open modal (or use `<dialog>.showModal()`, which does it).

### Keyboard patterns (WAI-ARIA Authoring Practices)

| Widget | Keys |
|---|---|
| Button | Enter, Space |
| Link | Enter |
| Checkbox / switch | Space |
| Radio group | Tab into group; arrows move and select |
| Tabs | ←/→ (Home/End); roving tabindex |
| Menu | Enter/Space/↓ opens; ↑/↓, Home/End, type-ahead; Esc closes |
| Listbox / combobox | ↑/↓, Enter selects, Esc closes, type-ahead |
| Dialog | Tab cycles inside; Esc closes |
| Slider | Arrows, PageUp/PageDown, Home/End |
| Tree / grid | Arrows move between cells/nodes; Enter activates |
| Accordion | Enter/Space on the header button |

**Roving tabindex:** in composite widgets (tabs, toolbars, menus, grids), only one item has `tabindex="0"` and the rest have `tabindex="-1"`. Arrow keys move both focus and the 0. Tab leaves the widget. This keeps the Tab sequence short.

**Shortcuts:** single-key shortcuts (like "j" for next) must be remappable or turned off, or work only when the relevant component is focused (WCAG 2.1.4). Show shortcuts in tooltips and menus.

### ARIA: use as little as possible

1. If a native element does it, use the native element.
2. Never change native semantics (`<h2 role="button">`). Wrap instead.
3. Every ARIA widget must support the full keyboard pattern. A `role="button"` on a div needs Enter, Space, focusability and a name.
4. Don't hide focusable elements with `aria-hidden="true"`.
5. Every interactive element has an accessible name.

Useful attributes: `aria-expanded`, `aria-controls`, `aria-current`, `aria-pressed`, `aria-selected`, `aria-checked`, `aria-invalid`, `aria-describedby`, `aria-busy`, `aria-live`, `aria-label`, `aria-labelledby`.

**Visually hidden text** (for screen readers only):

```css
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
```

Tailwind ships `sr-only` and `not-sr-only`.

### Live regions

| Use | Markup |
|---|---|
| Status updates, toasts, "Saved", result counts | `role="status"` (polite) |
| Urgent errors that interrupt | `role="alert"` (assertive) |
| Loading regions | `aria-busy="true"` on the region while loading |

The live region must exist in the DOM **before** its content changes. Inserting a new element that already contains its text is often not announced. Keep an empty `<div role="status">` mounted and set its text when something happens.

### Forms

- `<label for>` on every control; group related controls in `<fieldset>` + `<legend>`.
- Errors linked with `aria-describedby`, plus `aria-invalid="true"` on the control.
- Required fields use `required` (or `aria-required`), and the requirement is visible in text.
- Don't rely on placeholder text. Don't auto-advance focus between fields (e.g. one-time-code boxes) without careful testing; paste must work.
- Session timeouts warn the user and allow extending the session (WCAG 2.2.1).

## WCAG 2.2 criteria developers most often miss

| SC | Level | Requirement | Typical fix |
|---|---|---|---|
| 1.4.10 Reflow | AA | No 2-D scrolling at 320px wide | `min-w-0`, wrap long strings, responsive tables |
| 1.4.11 Non-text Contrast | AA | 3:1 for control boundaries, icons, focus | `--input` token, icon colors |
| 1.4.12 Text Spacing | AA | Layout survives increased line, letter and word spacing | No fixed heights on text containers |
| 1.4.13 Content on Hover or Focus | AA | Tooltips dismissible (Esc), hoverable, persistent | Use a tested tooltip primitive |
| 2.4.7 Focus Visible | AA | Visible focus indicator | `:focus-visible` ring |
| 2.4.11 Focus Not Obscured (Minimum) | AA | Focused element not fully hidden by sticky UI | `scroll-padding-top/bottom` |
| 2.5.7 Dragging Movements | AA | Single-pointer alternative to drag | Up/down buttons or a menu for reordering |
| 2.5.8 Target Size (Minimum) | AA | 24×24px or enough spacing | `--target-min` |
| 3.2.6 Consistent Help | A | Help links in the same place across pages | Fixed footer or header location |
| 3.3.7 Redundant Entry | A | Don't ask for the same info twice | Prefill, "same as" options |
| 3.3.8 Accessible Authentication (Minimum) | AA | No cognitive tests to log in | Allow paste and password managers, passkeys, magic links |

## User preference media queries

| Query | Respond with |
|---|---|
| `prefers-reduced-motion: reduce` | Fades instead of movement; no parallax or autoplay |
| `prefers-color-scheme: dark` | Default to the dark theme (user override still wins) |
| `prefers-contrast: more` | Stronger borders (`--border` → `--input`), no translucency, thicker focus rings |
| `prefers-reduced-transparency: reduce` | Solid backgrounds instead of glass/blur |
| `forced-colors: active` | Let system colors through (see below) |

## Expert: screen reader testing, forced colors, cognitive accessibility

### Screen readers

| Platform | Reader | Browser |
|---|---|---|
| Windows | NVDA (free), JAWS | Firefox, Chrome |
| macOS / iOS | VoiceOver | Safari |
| Android | TalkBack | Chrome |

Test the critical flows (sign-in, the main task, checkout) with at least VoiceOver + Safari and NVDA + Firefox or Chrome. Listen for unnamed buttons ("button"), missing state ("collapsed/expanded"), announcements that never come, and duplicate announcements.

### Forced colors (Windows High Contrast)

The OS replaces your colors with a small user-chosen palette. Background images and box-shadows disappear.
- Use `outline` and `border` (not box-shadow) for focus and boundaries. Transparent borders become visible in forced colors, so a `border: 1px solid transparent` on buttons keeps their shape.
- Use system colors where needed: `@media (forced-colors: active) { .focus { outline-color: Highlight; } }`.
- SVG icons should use `fill="currentColor"` so they follow text color.

### Cognitive accessibility

- Plain language: short sentences, common words, one idea per sentence.
- Consistent layout and naming across pages; the same action has the same label everywhere.
- Clear error recovery, undo for destructive actions, and no time limits without extension.
- Don't rely on memory: show previous answers, keep context visible across steps.
- Reduce distractions: no autoplay, no moving content near forms, minimal simultaneous notifications.

## Testing workflow

1. **Automated (catches about 30–40% of issues):** axe DevTools or `@axe-core/playwright` in CI, Lighthouse accessibility audit, `eslint-plugin-jsx-a11y` in the editor.
2. **Keyboard pass:** every page, every state.
3. **Zoom pass:** 200% and 400% (or a 320px-wide viewport).
4. **Contrast pass:** both themes, with `scripts/check-contrast.mjs` and DevTools.
5. **Screen reader pass:** critical flows.
6. **Preference pass:** reduced motion, dark mode, forced colors (Chrome DevTools → Rendering lets you emulate all of these).

```ts
// Playwright + axe example
import AxeBuilder from "@axe-core/playwright";
test("home has no a11y violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});
```
