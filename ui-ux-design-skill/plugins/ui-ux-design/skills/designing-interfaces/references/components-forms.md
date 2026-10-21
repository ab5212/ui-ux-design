# Components: forms

Text input, textarea, select, combobox, checkbox, radio, switch, slider, date and time, file upload, validation.

## Contents
- Field anatomy (applies to every control)
- Text input and textarea
- Choosing a selection control
- Select and combobox
- Checkbox, radio, switch
- Slider
- Date and time
- File upload
- Validation and errors

---

## Field anatomy (applies to every control)

```
Label  (optional / required marker)
[ control                         ]
Helper text or error message
```

| Part | Spec |
|---|---|
| Label | Above the control, `text-sm font-medium`, 6–8px gap to the control. Always a real `<label for>` |
| Control | 40px tall (md), `rounded-md`, 1px `border-input`, `bg-surface`, 12px horizontal padding, `text-base` on mobile |
| Helper | `text-sm text-muted-foreground`, 6px below, linked with `aria-describedby` |
| Error | Replaces or follows helper: icon + message in `text-destructive`, linked with `aria-describedby`; control gets `aria-invalid="true"` and a destructive border |
| Field gap | 16–20px between fields; 32px between groups |

**Labels above, not beside.** Top-aligned labels are fastest to scan and survive any screen width. Left-aligned labels are fine only for long settings forms on wide screens.

**Never use the placeholder as the label.** It disappears on typing, usually fails contrast, and screen readers treat it inconsistently. Floating labels are a compromise that keeps these problems on small screens; avoid them unless the system requires them.

**Mark the minority.** If most fields are required, mark the optional ones with "(optional)". If most are optional, mark required ones with "(required)" or an asterisk with a legend. Also set `required` / `aria-required` on the control.

## Text input and textarea

| State | Treatment |
|---|---|
| Default | `border-input` |
| Hover | Border one step darker (fine pointers only) |
| Focus | `ring-2 ring-ring` or 2px outline; border can switch to `--ring` |
| Invalid | `border-destructive`, icon + message below, `aria-invalid="true"` |
| Disabled | 50% opacity, `disabled` attribute, not focusable |
| Read-only | Normal contrast, no border or a dashed one, `readonly` attribute, still focusable and copyable |

- Use the right type and keyboard: `type="email" | "tel" | "url" | "search" | "password"`, `inputmode="numeric" | "decimal"`. Avoid `type="number"` for codes, card numbers and phone numbers.
- Add `autocomplete` to every personal-data field (`name`, `email`, `tel`, `street-address`, `postal-code`, `cc-number`, `one-time-code`, `new-password`, `current-password`).
- Size the field to its expected content where it helps (a postcode field shouldn't span 600px).
- **Prefix and suffix** (currency, units, icons) sit inside the border, in muted color, not part of the value.
- **Clear button** (×) only for search and filter fields; it needs an accessible name.
- **Password:** a show/hide toggle button (`aria-pressed`), never disable paste, show requirements before the user types, not after failure.
- **Textarea:** minimum 3 rows; `resize: vertical` (`resize-y`); `field-sizing: content` for auto-grow where supported; a character counter only if there's a limit (announce it with `aria-live="polite"` near the limit, not on every keystroke).

## Choosing a selection control

| Situation | Use |
|---|---|
| One choice, 2–5 options, all worth seeing | Radio group (or segmented control if it switches a view) |
| One choice, 6–15 options | Select |
| One choice, many options or needs search, or async results | Combobox (autocomplete) |
| Multiple choices, few options | Checkbox group |
| Multiple choices, many options | Multi-select combobox with chips |
| On/off that takes effect **immediately** | Switch |
| On/off that applies **on submit**, or legal consent | Single checkbox |
| A value in a continuous range where precision doesn't matter | Slider (plus a number input when precision matters) |

## Select and combobox

- **Native `<select>`** for simple lists. It's accessible, works with any keyboard and gives touch users the platform picker. Style the closed state (height, border, radius, a custom chevron via `appearance: none` plus a background icon) and leave the options native.
- **Custom listbox** only when you need icons, descriptions or rich options in the list. Use Radix Select, Headless UI Listbox or React Aria.
- **Combobox** (WAI-ARIA combobox pattern):
  - Focus stays in the input. ↓ opens the list; ↑/↓ move `aria-activedescendant`; Enter selects; Esc closes, and Esc again clears.
  - Show "No results for 'xyz'" plus a way forward (create, clear filters).
  - Debounce async searches by about 200–300ms and show a loading row.
  - Highlight the matched substring.
- Option rows are 32–36px (40–44 on touch). The list max-height is about 300px with scroll, and it flips above the field when there's no room below.

## Checkbox, radio, switch

| | Checkbox | Radio | Switch |
|---|---|---|---|
| Visual size | 16–20px box, `rounded-xs` | 16–20px circle | 36–44 × 20–24px track, thumb with 2px inset |
| Hit area | Whole label row, at least 24px tall (44 on touch) | Same | Same |
| Checked | `bg-primary` + white check icon | Filled inner dot | Track `bg-primary`, thumb slides to the end |
| Keyboard | Space toggles | Tab enters the group; arrows move and select | Space toggles (Enter optional) |
| Element | `<input type="checkbox">` | `<input type="radio">` in a `<fieldset>` with `<legend>` | `<button role="switch" aria-checked>` or a checkbox with `role="switch"` |

- Group related checkboxes and radios in `<fieldset>` + `<legend>` so the group question is announced.
- Indeterminate checkbox ("some selected") for parent rows: set `el.indeterminate = true` in JavaScript and show a dash.
- Switch labels describe the setting, not the state: "Email notifications", not "On". The switch shows the state. Don't add "On/Off" text inside the track unless space allows both languages.
- Unchecked controls need a visible boundary at 3:1 (`--input`).

## Slider

- Thumb at least 24px (44 hit area on touch); track 4–6px tall; filled part in `--primary`.
- Always show the current value (a label beside it or a tooltip on drag), and pair it with a number input when exact values matter.
- `role="slider"` (or native `<input type="range">`) with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext` for formatted values ("$40").
- Keyboard: ←/→ and ↑/↓ step; PageUp/PageDown take big steps; Home/End go to min/max.
- Range sliders have two thumbs, each a separate slider with its own label ("Minimum price").

## Date and time

| Situation | Use |
|---|---|
| Memorable date (date of birth, expiry) | Separate text fields for day, month, year (GOV.UK pattern); no picker needed |
| Near-future scheduling | Text input that accepts typing, plus a calendar popover |
| Date ranges (bookings, reports) | Two-month calendar on expanded screens, one on compact; preset ranges ("Last 7 days") |
| Mobile, simple date | Native `<input type="date">` |
| Time | Text input with format hint, or native `type="time"` |

- Always allow typing. Clicking back 40 years in a calendar to find a birth year is hostile.
- Show the expected format in the helper text ("e.g. 27 3 2026") and accept several formats.
- Calendar grid keyboard: arrows move by day and week; PageUp/PageDown by month; Home/End go to week start/end; Enter selects.
- Display dates with `Intl.DateTimeFormat` in the user's locale; store them in ISO 8601 with time zones explicit.

## File upload

- A clear target: a dashed-border drop zone **plus** a real "Choose file" button (drag-and-drop alone fails keyboard and mobile users).
- State accepted types and the size limit before upload ("PNG or JPG, up to 10 MB").
- Show per-file progress, a cancel button, and a clear error per file ("photo.heic: format not supported").
- Use `accept` on the input; on mobile, `capture` opens the camera when that's the intended use.

## Validation and errors

**When to validate**
1. Never validate while the user is still typing a field for the first time.
2. Validate a field when the user leaves it (on blur), if it has content.
3. Once a field has shown an error, re-validate on each change so the error clears as soon as it's fixed.
4. On submit, validate everything. Move focus to an **error summary** at the top that lists each error as a link to its field (GOV.UK pattern). For short forms, focus the first invalid field instead.

**What an error says:** what's wrong and how to fix it, in plain words, without blame.

| Bad | Good |
|---|---|
| Invalid input | Enter an email address like name@example.com |
| Error 422 | This username is taken. Try adding a number |
| Field required | Enter your postcode |
| Password does not meet requirements | Use at least 12 characters |

**Rules**
- Errors appear next to the field, not only in a toast.
- Keep the user's input when showing errors. Never clear a form because one field failed.
- Don't disable the submit button to signal invalid fields. Users can't tell what's wrong. Let them submit and show the errors.
- Server errors get the same treatment as client errors: mapped to fields where possible, otherwise an alert at the top of the form.
- Don't ask for the same information twice in a flow (WCAG 3.3.7); pre-fill it or offer "Same as shipping address".
- Confirm success visibly: a message, a redirect, or an updated view. Announce it with a live region.
