---
name: designing-interfaces
description: Expert UI/UX rules for any front-end stack (HTML/CSS, Tailwind, React, Vue, Svelte, Angular, Astro, server templates) that look designed, not generated: tokens, typography, color, responsive layouts, component specs, accessibility (WCAG 2.2 AA), and a live localhost playground. Asks the user first: which visual style, which framework, and what to change. Turns screenshots and mockups into code, audits existing code and applies only the changes the user approves. Use whenever you build, restyle, review or theme any web UI, or are given a screenshot, even if they never say "design".
---

# Designing Interfaces

These are design decisions a senior product designer would make, written as rules you can apply in code. The defaults below hold up for most web products. When a project already has its own decisions, follow those: consistency within a product beats any guideline.

The rules are framework-agnostic. The code examples use React and Tailwind v4 because that is the playground stack. `references/frameworks.md` translates them to plain HTML + CSS, Vue, Svelte, Angular, Astro, Bootstrap, web components and server templates, and `assets/tokens.plain.css` plus `assets/plain/` give a build-free baseline for any of them.

## Step 0: Where are you, and what did the user give you?

| You have | Mode | Do |
|---|---|---|
| File and shell access to the user's project (Claude Code, Codex, Gemini CLI, Cursor…) | **Project mode** | Read the stack (Step 1). Existing UI code plus a review, polish or fix request: **audit first**, show the findings as choices, change nothing until the user picks (`references/audit-existing-code.md`). New UI: Step 2. |
| Only a chat (ChatGPT, Gemini, Claude.ai…) | **Chat mode** | You can't see their code or run scripts. Ask for what you need, deliver one complete runnable file (`references/environments.md`). |
| An image: a screenshot, mockup or sketch | **Screenshot flow** | **Don't generate yet.** Ask what to do with it, the look and feel if redesigning, and the output technology (`references/screenshot-to-code.md`). |

Whatever the mode: **never generate, restyle or change a UI from a vague request.** Ask one short message of at most three questions in Project mode (four in Chat mode), with options, a recommended default and "not sure, you choose". Skip anything the user already said or the project already shows. Use your interactive question tool if you have one; otherwise send a numbered list and stop until the user replies.

## Step 1: Read the project (Project mode)

Developers install this skill into real projects. Never impose a second design system on top of an existing one.

1. **Find the stack.** Open `package.json` and find the framework (React, Next, Vue, Nuxt, Svelte, Astro, Angular).
2. **Find the styling system.**
   - Tailwind v4: the CSS contains `@import "tailwindcss"` and `@theme`.
   - Tailwind v3: a `tailwind.config.*` file exists.
   - Otherwise: CSS Modules, Sass, styled-components, vanilla-extract or plain CSS.
3. **Find the component library.**
   - shadcn/ui: `components.json` exists.
   - Others to look for: Radix, MUI, Chakra, Mantine, Headless UI, Ant Design.
   - If one is present, build on top of it.
4. **Find existing tokens.** Look for CSS custom properties on `:root`, theme files, `tailwind.config` `theme.extend`, or a `tokens.json`.
5. **Decide.**
   - **Tokens exist:** map these rules onto them. Fill gaps by adding tokens in the same naming style.
   - **No tokens:** copy `assets/tokens.css` (this skill's folder) into the project's global CSS and adapt the brand hue.
   - **A component library exists:** theme it. Don't replace it.
6. **Then settle the design direction in Step 2.** Don't pick a visual style yourself.

## Step 2: Settle the design direction, and ask the user

The visual style is the user's decision. Read `references/direction.md` whenever the task creates new UI (a new app, a set of pages, a component library, a theme, or a "make it look better" restyle). In short:

1. **`DESIGN.md` exists in the repo root?** Follow it. Don't ask.
2. **The user already named a style, or the project already has a design language?** Apply or extend it, and say in one line what you're following. Don't ask about style.
3. **Small change** (a bug fix, an accessibility fix, one component beside its neighbors)? Match what's there. Don't ask.
4. **Otherwise, ask before writing any UI code.** One message, at most three questions, each with two to four plain-language options and a recommended default: look and feel (offer only the styles that fit the product), brand color, and main device. Use your interactive question tool if you have one (for example `AskUserQuestion`); if not, send a numbered list and stop until the user replies.
5. **Apply the answer:** layer the matching preset from `assets/styles/` after `assets/tokens.css`, set `--brand-h`, and write `DESIGN.md` so the next session doesn't ask again.
6. **No one to ask** (headless run)? Use the recommended default for the product type, mark it *assumed* in `DESIGN.md`, and say how to change it.

## Step 3: Choose the output technology

- **Project mode:** read it from `package.json` and the files, and say it in one line ("Using Vue 3 with scoped styles"). Ask only for a monorepo with several apps, or when the request implies a different stack.
- **Chat mode, or a screenshot with no project:** ask, unless the user already said. Offer: one HTML + CSS file *(recommended, runs anywhere)*, HTML + Tailwind, React, Vue / Svelte / Angular, other.
- Translate the design with `references/frameworks.md`. Plain HTML + CSS is always available through `assets/tokens.plain.css` and `assets/plain/components.css`.

## Workflow

1. **Tokens.** Set or confirm color, type, spacing, radius, shadow, motion and z-index tokens, including the style preset chosen in Step 1. Components never contain raw hex values, raw pixel radii or magic numbers.
2. **Layout and responsive plan.** Decide what changes between compact, medium and expanded widths (navigation, columns, which components change form) before building screens. See `references/responsive.md`.
3. **Components.** Build each component to the delivery contract below.
4. **Content and states.** Use real copy. Build the empty, loading, error, long-text and no-permission states, not just the happy path.
5. **Review.** Run `references/review-checklist.md` against the result and fix everything at severity "blocker" and "major".
6. **Verify.** Check the UI at 360, 768, 1280 and 1920px wide, in light and dark mode, with keyboard only. Use the project's own dev server. Use the playground (below) when there is no app yet or the user wants a component gallery.

## Which reference to read

Read only the files the task needs. Each file starts with beginner defaults, then advanced and expert sections. Stop once you have what you need.

| Task | Read |
|---|---|
| Screenshot, mockup or sketch to code | `references/screenshot-to-code.md` |
| Reviewing or improving existing code, "make this accessible/responsive" | `references/audit-existing-code.md` |
| HTML, CSS, Tailwind, React, Vue, Svelte, Angular, Astro, Bootstrap, templates | `references/frameworks.md` |
| Which mode you're in, what to ask, where this skill runs (chat vs agent) | `references/environments.md` |
| Choosing a visual style, asking the user, style presets, `DESIGN.md` | `references/direction.md` |
| Set up or audit tokens, Tailwind theme, CSS variables, theming, dark mode wiring | `references/tokens.md` |
| Fonts, type scale, line height, line length, numbers | `references/typography.md` |
| Icons and font loading (Google Fonts, Material Symbols) | `references/icons-fonts.md` |
| Palette, semantic colors, contrast, dark mode, states | `references/color.md` |
| Spacing scale, grids, density, alignment | `references/spacing-layout.md` |
| Mobile, tablet, laptop, desktop, ultrawide; navigation per size; touch vs mouse | `references/responsive.md` |
| Corner radius, nested radius, shadows, borders, z-index | `references/shape-elevation.md` |
| Buttons, icon buttons, links, menus, command palette | `references/components-actions.md` |
| Inputs, select, combobox, checkbox, radio, switch, slider, date, validation | `references/components-forms.md` |
| Dialog, drawer, sheet, popover, tooltip, toast, alert | `references/components-overlays.md` |
| Navbar, sidebar, tabs, accordion, breadcrumbs, pagination, stepper | `references/components-navigation.md` |
| Card, table, list, badge, avatar, progress, skeleton, empty state | `references/components-data-display.md` |
| Transitions, durations, easing, reduced motion | `references/motion.md` |
| Keyboard, focus, ARIA, screen readers, WCAG 2.2 | `references/accessibility.md` |
| Heuristics, forms UX, errors, microcopy, loading, onboarding | `references/ux-patterns.md` |
| Glassmorphism, neumorphism, brutalism, bento, Liquid Glass, dark UI | `references/visual-styles.md` |
| Reviewing a UI, or making it look "less AI-generated" | `references/review-checklist.md` |
| Unfamiliar term | `references/glossary.md` |

## Defaults at a glance

Use these when the project has no decision of its own.

| Decision | Default |
|---|---|
| Spacing unit | 4px; scale 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 |
| Body text | 16px, line-height 1.5, max 65ch per line |
| Type scale | 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60, ratio about 1.25 |
| Weights | 400 body, 500 UI labels, 600 headings; 700 only for display |
| Control heights | 32 sm / 40 md (default) / 48 lg |
| Radius scale | 2 / 4 / 6 / 8 / 12 / 16 / 24 / full; controls 6, cards 12, dialogs 16 |
| Nested radius | outer = inner + padding (+ border width) |
| Contrast | text 4.5:1, large text 3:1, UI boundaries and focus rings 3:1 |
| Touch targets | at least 24×24 CSS px everywhere; 44×44 on touch layouts |
| Focus ring | 2px solid `--ring`, 2px offset, on `:focus-visible` |
| Motion | 120ms micro, 200ms default, 300ms panels; animate transform and opacity only |
| Breakpoints | 640 / 768 / 1024 / 1280 / 1536 (Tailwind), designed mobile-first |
| Content width | about 680px for reading, 1200–1440px for apps |
| Color format | OKLCH semantic tokens (`--primary`, `--primary-foreground`, …) |

## Non-negotiables

These rules hold regardless of style or brand.

1. Use semantic HTML first: `<button>` for actions, `<a href>` for navigation, real `<label>` elements, `<table>` for tabular data. Add ARIA only when no native element exists.
2. Every interactive element has a visible `:focus-visible` style with at least 3:1 contrast. Never write `outline: none` without a replacement.
3. Never convey meaning with color alone. Add an icon, text, a pattern or position.
4. Text meets 4.5:1 contrast (3:1 for 24px+ or 18.66px+ bold). Check both themes.
5. Hit areas are at least 24×24px, and 44×44px on touch-first layouts. Expand small icons with padding or a pseudo-element.
6. Body text and inputs are at least 16px on mobile (iOS zooms into smaller inputs).
7. Layouts must not scroll sideways at 320px wide or at 200% zoom.
8. Never put information or actions only behind hover. Touch users and keyboard users can't hover.
9. Honor `prefers-reduced-motion`: replace movement with short fades and stop parallax and autoplay.
10. Use one primary button per view or region. Everything else is secondary, tertiary or a link.
11. Labels sit above inputs. Placeholders are hints, never labels.
12. Errors say what happened and how to fix it, next to the field, linked with `aria-describedby`.
13. Modals trap focus, close on Esc, and return focus to the element that opened them.
14. No hardcoded colors, radii, shadows or durations inside components. Use tokens only.
15. Dark mode uses its own tuned values. Never invert colors or apply `filter: invert()`.
16. Use one radius family and one depth method (shadow-led or border-led) per product.
17. Loading: show nothing for under 300ms, skeletons for known layouts, determinate progress for over 10s.
18. Numbers in tables, prices and timers use `tabular-nums` and are right-aligned in columns.
19. Images have `width`/`height` or `aspect-ratio` to avoid layout shift, and meaningful `alt` text (or `alt=""` if decorative).
20. Write real, specific copy: buttons are verb + object ("Save changes"), in sentence case.
21. Never choose the visual style of a new UI silently. Ask (or follow `DESIGN.md`), per `references/direction.md`.
22. Never rewrite existing code unasked. Show findings as numbered choices and change only what the user approves (`references/audit-existing-code.md`).
23. Never start from an image without asking what to do with it, and never copy logos, brand marks or proprietary assets from one.
24. Fonts come from Google Fonts and icons from Material Symbols (https://fonts.google.com, https://fonts.google.com/icons). No other icon sets, no emoji icons. Setup: `references/icons-fonts.md`.

## Component delivery contract

Every component you create or substantially change ships with:

- **Semantics:** the correct element or role, an accessible name, and a keyboard pattern matching the WAI-ARIA Authoring Practices.
- **States:** default, hover, focus-visible, active, disabled, plus loading, invalid, selected or read-only where they apply.
- **Sizes:** driven by tokens (`sm`, `md`, `lg`), never by one-off values.
- **Responsive behavior:** stated explicitly, e.g. "Dialog becomes a bottom sheet under 640px."
- **Themes:** correct in both dark and light.
- **Motion:** reduced-motion safe.
- **Content:** handles long text, missing data and right-to-left text (use logical properties: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start`, `end`).

If the user only wants a quick prototype, say which parts of this contract you skipped.

## The localhost playground

`<this-skill-dir>` below means the folder that contains this `SKILL.md`, wherever it was installed (a plugin cache, `.claude/skills/`, `.agents/skills/`).

`assets/playground/` is a complete Vite + React + TypeScript + Tailwind v4 app. It renders every foundation and component in all variants, sizes and states, with live toggles for theme, density, radius, brand hue and reduced motion, plus a responsive viewport switcher (360 / 768 / 1024 / 1440 / 1920).

Use it when the user asks for a component gallery, a design system preview or a style guide, or when you need to show token choices before building screens. Don't use it in place of the project's own dev server when an app already exists.

```bash
bash <this-skill-dir>/scripts/scaffold-playground.sh ./ui-playground   # copies template + npm install
cd ui-playground && npm run dev                                         # http://localhost:5173
```

To refresh a playground the user made earlier (after a plugin update), add `--update` and the same folder; it keeps their saved choices. To preview a style from Step 1 before building, add `--style glass` (`flat`, `material`, `soft`, `glass`, `clay`, `skeuomorphic`, `brutalist`, `editorial`, `monochrome`, `colorblock`, `retro`, `minimalvintage`, `retrofuturistic` or `artdeco`). To preview the project's own tokens, add `--tokens path/to/tokens.css` to the scaffold command. If the variable names differ from this skill's, edit the `@theme inline` block in `ui-playground/src/styles/tokens.css` to match. The script needs Node.js 20.19+ and refuses to overwrite a non-empty directory.

Audit the code of any front-end project (any stack), or the contrast of a token file, at any time:

```bash
node <this-skill-dir>/scripts/audit-frontend.mjs path/to/project            # accessibility, responsive, tokens, motion
node <this-skill-dir>/scripts/check-contrast.mjs path/to/tokens.css [style.css]
```

## Reviewing an existing UI

Follow `references/audit-existing-code.md`: scan with `scripts/audit-frontend.mjs`, read what matters, then present the findings as grouped, numbered choices and **stop until the user picks**. Apply only the approved items, in the project's own conventions, then verify and report. Use `references/review-checklist.md` for what the scanner can't see. Don't restyle what already works just to match these defaults.
