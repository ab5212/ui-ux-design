# From a screenshot or mockup to code

A screenshot is a picture of one state at one width. It doesn't say what the user wants done with it. Ask first, then build.

## Contents
- Step 1: ask before you generate
- Step 2: read the image
- Step 3: choose the structure
- Step 4: map to tokens
- Step 5: build
- Step 6: check and report
- Edge cases

---

## Step 1: ask before you generate

Do **not** start writing code when an image arrives. Send one message with up to three questions (four in Chat mode, if you also need the output technology). Skip any question the user already answered.

**Q1. What should I do with this?**
1. **Recreate it as closely as I can** *(recommended when the user says "make this" or "copy this")*
2. **Keep the layout, but improve it:** spacing, type, contrast, accessibility, responsive behavior
3. **Redesign it in a different style:** then ask Q2
4. **Review only:** list what's wrong or risky, write no code
5. **Change something specific:** ask them to say what

**Q2. Look and feel** (only for options 2 and 3). Offer the styles that fit the product (`direction.md`). For option 2, add "Keep the look from the screenshot".

**Q3. Output technology** (unless the project or the user already says). See `environments.md`: single-file HTML + CSS *(recommended)*, HTML + Tailwind, React, Vue, Svelte, Angular, other.

Ask a fourth thing only if the answer would change the result: "Is this a phone or a desktop screenshot?" when the width is unclear, or "Should it work on other screen sizes?" (default: yes, mobile-first).

Example message:

> I can turn this into code. Three quick choices first:
>
> **1. What should I do?** (a) recreate it as closely as I can *(recommended)*, (b) keep the layout but polish it, (c) redesign it in another style, (d) review only, no code
> **2. Output:** (a) one HTML + CSS file *(recommended, runs anywhere)*, (b) HTML + Tailwind, (c) React, (d) Vue / Svelte / Angular, (e) other
> **3. Responsive?** (a) yes, make it work on phones too *(recommended)*, (b) match this width only

## Step 2: read the image

Work top to bottom and write down what you see before you build. If you can see the image only vaguely, say so and ask for a clearer one.

1. **Regions:** header, navigation, hero, sidebar, main content, cards, tables, forms, footer. Name each.
2. **Layout:** columns, alignment, container width (full-bleed or centered), what aligns with what.
3. **Components:** buttons (how many variants), inputs, tabs, cards, badges, avatars, icons, charts. Count the distinct kinds.
4. **Text:** transcribe the visible copy exactly. Mark anything unreadable as `[unreadable]` and don't invent it.
5. **Colors:** background, surfaces, text, muted text, accent, status colors, borders. Estimate hex values by eye. With a shell and Python, sample real pixels instead (`PIL.Image.getpixel`).
6. **Type:** serif, sans, mono, or display? Estimate sizes relative to body text, and the weights used.
7. **Spacing:** judge the gaps against the text height, then snap to the 4px scale (`spacing-layout.md`).
8. **Not visible:** hover, focus, error, loading, empty and dark states, the behavior on other widths, and the real images, logos and fonts. List these; you will assume them.

Be honest about precision: you can match structure, hierarchy and proportions closely, but not exact pixel values or fonts. Say "within a few pixels" rather than "pixel perfect".

## Step 3: choose the structure

- **Semantic HTML first:** `<header>`, `<nav>`, `<main>`, `<section>`, headings in order, `<button>` for actions, `<a>` for navigation, `<table>` for tabular data, real `<label>`s.
- **Layout with the modern tools:** CSS grid for page structure, flexbox for rows, `gap` for spacing, `auto-fit` grids for card collections. No absolute positioning for layout, no spacer elements.
- **Mobile-first.** Write the compact layout first and add `min-width` queries (`responsive.md`). If the screenshot is a desktop view, decide how each region reflows on a phone: sidebar becomes a drawer or bottom navigation, columns stack, tables scroll or become cards.

## Step 4: map to tokens

Don't paste raw hex values into components.

1. Pick the base: `assets/tokens.plain.css` (any target) or `tokens.css` (Tailwind v4). In Chat mode paste the values from `references/starter-css.md`.
2. Set `--brand-h` to the screenshot's accent hue, then check the pairs. If the screenshot's accent is a light yellow, keep it for fills with dark text and use a darker sibling for text and links.
3. Map each color you sampled to a role: `--background`, `--surface`, `--foreground`, `--muted-foreground`, `--primary`, `--border`, and status colors. If the design uses a color that has no role, add a token rather than a raw value.
4. Snap type sizes to the scale (`typography.md`) and spacing to the 4px scale. Snap radius to the closest step.

**Fidelity vs correctness:** if the screenshot breaks a rule that affects users (gray text under 4.5:1, a 28px tap target, no visible focus, an input without a label), don't copy it silently. Build the corrected version, say what you changed, and offer "keep exactly as in the screenshot" if they want it.

> The light gray captions in your screenshot measure about 2.6:1. I used `--muted-foreground` (6.3:1). Say the word and I'll match the original instead.

## Step 5: build

- **Complete and runnable.** One HTML file with a `<style>` block (and a few lines of JS for interactive parts) is the default in Chat mode. In Project mode, write into the project's structure.
- **Components with all their states:** hover, `:focus-visible`, active, disabled, plus loading and error where they apply, even though the screenshot shows one.
- **Interactive parts that need behavior** use the platform: `<dialog>` for modals, `<details>` for disclosure, `aria-expanded` on menu buttons, `aria-current` on the active nav item.
- **Images:** use a placeholder with the right `aspect-ratio` and a meaningful `alt` (or `alt=""` if decorative). Say what to replace. Don't hotlink images or fonts you can't license.
- **Icons:** Material Symbols (https://fonts.google.com/icons) as `<span class="material-symbols-rounded" aria-hidden="true">name</span>` with a text label nearby. Pick the closest Material Symbols name for each icon in the image. See `references/icons-fonts.md`.
- **Fonts:** choose the nearest widely available family, or the system stack, and say what the screenshot seems to use. Don't claim a match you can't confirm.
- **Dark mode:** include it if tokens are in use (it comes with the token file) unless the user said not to.
- **Copy:** use the transcribed text. Replace obvious filler only if the user asked.

## Step 6: check and report

With a browser tool: render the result at the screenshot's width and at 390px, compare it with the original, and fix visible differences. Without one: say "I couldn't render this; here is what to compare".

End with a short report:

1. **What I built** and how to run it (one line).
2. **Assumptions** I made (fonts, hover states, other widths, images).
3. **What I changed from the screenshot** and why (accessibility, responsive).
4. **Two or three next steps** the user can ask for (dark mode, a Vue version, real data states, a component split).

## Edge cases

- **Several screenshots:** treat each as a screen. Ask how they connect (navigation, shared header) and build shared parts once.
- **A mockup with annotations:** the annotations win over the picture.
- **A photo of a sketch or a whiteboard:** it conveys structure only; ask about look and feel and content.
- **A screenshot of a competitor's or someone else's site:** build the layout pattern and your own tokens. Don't copy logos, brand marks, proprietary illustrations or text you don't have the right to use.
- **A screenshot containing personal data:** don't repeat it beyond what the build needs; use placeholders in the code.
- **A tiny or blurry image:** say what you can't make out and ask for a larger one before guessing.
- **A screenshot of a bug in code the user already has:** switch to `audit-existing-code.md`, and ask for the code.
