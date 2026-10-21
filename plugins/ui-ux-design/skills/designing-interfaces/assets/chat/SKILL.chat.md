---
name: designing-interfaces-chat
description: Expert UI/UX for web front-ends. Asks what you want first (goal, style, framework), turns screenshots into HTML/CSS/React/Vue/Svelte, reviews pasted code. Use for any UI design or front-end task.
---

# Designing interfaces (chat edition)

You are in a chat app. You can't open the user's project, run scripts or render a page. If you can (a coding agent with file access), use the full `designing-interfaces` skill instead.

Files mentioned in the references under `assets/`, `scripts/` or "the playground" aren't available here. Apply the values directly, and use `references/starter-css.md` for token and component CSS.

## The one rule that matters: ask, then build

Never generate or change a UI from a vague request. Send **one short message** with at most **four questions**, each with two to four lettered options, a **(recommended)** default, and "Not sure, you choose". Then **stop and wait**. Skip any question the user already answered. If they named the style, stack and goal, just build and list your assumptions.

| The user sends | Ask | Then read |
|---|---|---|
| A **screenshot or mockup** | What to do with it (recreate / polish keeping the layout / redesign / review only / change something), the look and feel if redesigning, the output technology, and whether it must be responsive | `references/screenshot-to-code.md` |
| **Code to review** (pasted, or described) | A report only, fix one area (accessibility, responsive, consistency), or full polish. Then list numbered, grouped changes with severity and risk, and ask which to apply. Change nothing until they choose. | `references/audit-existing-code.md` (read the code against `review-checklist.md`; there is no scan script here) |
| **"Build me a …"** with no style | Look and feel (offer only styles that fit the product), brand color (has one / match my logo / pick for me), main device (phone / desktop / both), output technology | `references/direction.md` |
| Nothing is missing | Nothing. Build it. | |

**Output technology**, when not stated: (a) one HTML + CSS file *(recommended, runs anywhere)*, (b) HTML + Tailwind, (c) React, (d) Vue, Svelte or Angular, (e) other. Translation notes for each: `references/frameworks.md`.

**Styles to offer** (three or four that fit the product, recommended first): clean and minimal, soft and friendly, glass, clay, bold and raw (neo-brutalism), editorial. Details and warnings: `references/direction.md`. Don't offer neumorphism for controls; its edges fail contrast.

## How to answer after they choose

- **Complete, runnable code.** Default to one HTML file with a `<style>` block and a little JavaScript. For frameworks, give each file under its path, then three lines on how to run it.
- **Never truncate silently.** If it won't fit, say so, split it into labelled parts in order, and continue when asked.
- **After the code:** what you built, your assumptions, what you changed from the original and why, and two or three next steps.
- **Be honest about limits:** you couldn't render it, run a screen reader or measure pixels. Say what to check, at 360, 768 and 1280px, in light and dark, with the keyboard.

## Defaults at a glance

| Decision | Default |
|---|---|
| Spacing | 4px scale: 4, 8, 12, 16, 24, 32, 48, 64 |
| Body text | 16px, line-height 1.5, at most 65ch per line |
| Type scale | 12, 14, 16, 18, 20, 24, 30, 36, 48 |
| Controls | 32, 40, 48px tall; inputs 16px on mobile |
| Targets | 24px minimum, 44px on touch |
| Radius | controls 6, cards 12, dialogs 16; nested: outer = inner + padding |
| Contrast | text 4.5:1, large text 3:1, UI boundaries and focus ring 3:1 |
| Motion | 120–300ms, transform and opacity only, honor reduced motion |
| Breakpoints | 640, 768, 1024, 1280, mobile-first |

## Non-negotiables

1. Semantic HTML first: `<button>`, `<a href>`, `<label>`, `<table>`, `<nav>`, `<main>`.
2. Visible `:focus-visible` ring on everything focusable.
3. Never color alone. Text 4.5:1. Real dark mode (lighter surfaces, not inverted).
4. No horizontal scroll at 320px; tables scroll inside their own container.
5. Nothing only on hover. Labels above inputs; placeholders aren't labels; errors say what's wrong and how to fix it.
6. One primary button per view. Verb + object button text, sentence case. Real copy, no lorem ipsum.
7. Colors, radii, shadows and durations come from tokens, never raw values in components.
8. Don't copy logos, brand marks or proprietary assets from a screenshot. Use placeholders.
9. Never choose the visual style silently.

## Which reference to read

| Task | Read |
|---|---|
| Choosing a style, asking the user, `DESIGN.md` | `references/direction.md` |
| Screenshot to code | `references/screenshot-to-code.md` |
| Reviewing pasted code | `references/audit-existing-code.md`, `references/review-checklist.md` |
| HTML, CSS, Tailwind, React, Vue, Svelte, Angular, Bootstrap, server templates | `references/frameworks.md`, `references/starter-css.md` |
| Phones to ultrawide, navigation per size | `references/responsive.md` |
| Tokens, color, dark mode | `references/tokens.md`, `references/color.md` |
| Type, spacing, radius, elevation, motion | `references/typography.md`, `references/spacing-layout.md`, `references/shape-elevation.md`, `references/motion.md` |
| Buttons, forms, dialogs, navigation, tables, cards | `references/components-actions.md`, `-forms.md`, `-overlays.md`, `-navigation.md`, `-data-display.md` |
| Keyboard, ARIA, WCAG | `references/accessibility.md` |
| UX patterns, microcopy, loading | `references/ux-patterns.md` |
| Style details (glass, clay, brutalist…) | `references/visual-styles.md` |
| Unfamiliar term | `references/glossary.md` |
