# Applying playground changes to the user's code

The playground's **Your app** view lets a user restyle and restructure their running app, then press **Save to code**. Style changes become CSS. Structural changes (move, insert, delete, group, text) cannot be written safely by the playground, so they are saved as a change list for you to apply to the real source files, after the user approves.

## Files (beside the user's tokens file)

| File | What it holds | What to do |
|---|---|---|
| `playground-overrides.css` | Per-element style edits as `selector { prop: value !important }` | Make sure the app imports it once. When asked, fold the rules into the component's own styles (tokens, classes) and drop the `!important`. |
| `playground-changes.json` | `edits` (the same styles as data) and `ops` (structural changes, in order) | Apply the ops below to the source. |
| `playground-layout.json` | A dashboard layout: `columns`, `kpiStyle`, and `widgets` (type, span, title, value, delta, data) | Build the dashboard as written. |
| the tokens file | The chosen style preset, colors, fonts, radius, spacing | Already applied. Do not ask those questions again. |

## The `ops` list

Apply the ops **in order**. Each op names its element by `selector` (unique when it was recorded, valid for the page state after the earlier ops) and carries a `ref` snapshot (`tag`, `classes`, `text`, `html`) so you can find the matching JSX, template or HTML in the source. Use `summary` to tell the user what you are doing.

| `op` | Fields | Source change |
|---|---|---|
| `move` | `target`, `parent`, `index` | Move the element to be child number `index` (0-based) of `parent` |
| `insert` | `parent`, `index`, `html`, `kind` | Add a new element of that kind at that position. Rebuild it with the project's own components and tokens; `html` is a preview, not final markup |
| `delete` | `target` | Remove the element |
| `duplicate` | `target` | Copy the element and place the copy right after it |
| `group` | `targets`, `layout` (`row` or `column`) | Wrap the elements in a new flex container (`gap` 8px) in that direction |
| `ungroup` | `target` | Remove the wrapper and keep its children in place |
| `text` | `target`, `from`, `to` | Change the text. Use the project's i18n key if it has one |
| `menu-items` | `target`, `items` (`label`, `icon`) | Set the items of that kebab menu |

## Rules

- Show the user the list of `summary` lines and get approval before editing. Apply only what they approve (`audit-existing-code.md`).
- Match elements by `ref`, not by `selector` alone. Selectors come from the running DOM, so they include class names that may be generated.
- If an element is rendered from data (a list or loop), change the template once, not each item.
- Inserted icons are Material Symbols and fonts are Google Fonts (`icons-fonts.md`). Use real project components for buttons, menus and charts, with the app's tokens.
- After applying, delete the three `playground-*` files only if the user says so; they are the record of what was asked.
