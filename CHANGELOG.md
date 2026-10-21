# Changelog

Bump `version` in **both** plugin manifests for every release; users only receive updates when it changes.

## 1.3.0
- Fonts and icons: every UI the skill builds uses Google Fonts and Material Symbols (new `references/icons-fonts.md`, non-negotiable 24, chat edition and paste instructions updated). The playground swapped `lucide-react` for Material Symbols and loads Inter, Source Serif 4 and Roboto Mono from Google Fonts.
- Styles: 9 new presets (flat, material, skeuomorphic, monochromatic, color blocking, retro / vintage, minimal vintage, retro-futuristic, art deco), 14 in all, each with light and dark themes and passing the contrast check at every hue tested (12 hues). The skill now offers them at the start (filtered by product type, with a "show me all" option) and offers layout add-ons (cards, grid, single page, fullscreen, typography-led, asymmetrical, illustrative, parallax). New style index in `visual-styles.md`. `scaffold-playground.sh --style` loads a preset's Google Fonts.
- Playground: per-color editor with live contrast and automatic readable text color, a Google Fonts box for any family, a **Your app** view that live-restyles the user's own running app (via `public/bridge.js`), and a dashboard builder (grid size, KPI card style, widgets, drag to reorder) whose layout Save writes to `playground-layout.json`. The radius scale, nested-radius demo and spacing scale now follow the Corners and Spacing controls.
- Playground: a Style picker switches between all 14 presets live (the scaffold script copies them into `src/styles/presets`), and Save to code writes the chosen preset. Controls left on "Default" now let the preset show through. Shadows only affect the base style, because presets define their own shadow tokens.
- Playground: new Borders, Shadows, Font, Text size and Spacing controls, and a "Save to code" button that writes the choices into the tokens file (`PLAYGROUND_TOKENS` picks the file). New `--border-w` and `--shadow-scale` tokens.

## 1.2.0
- Works with any front-end stack: plain HTML + CSS (new `tokens.plain.css`, `plain/components.css`, `plain/example.html`), Tailwind, React, Vue, Svelte, Angular, Astro, Bootstrap, web components and server templates (`references/frameworks.md`).
- Ask-first behavior in every mode: Project mode (audit first, change nothing until the user picks), Chat mode, and a Screenshot flow that asks what to do with the image before generating code.
- New `scripts/audit-frontend.mjs`: scans HTML, CSS, JS/TS, JSX, Vue, Svelte, Astro and templates for accessibility, responsive, token and motion problems.
- Chat edition for ChatGPT, Claude.ai and Gemini uploads (`scripts/build-chat-package.sh`, short description, no scripts) and a single-paste instruction file for Custom GPTs, Gems and Projects.
- `check-contrast.mjs` now fails when it finds no color pairs, instead of reporting a vacuous pass.

## 1.1.0
- The skill asks the user which visual style they want before building new UI, and records the choice in `DESIGN.md`.
- Five style presets: soft, glass, clay, brutalist, editorial. `scaffold-playground.sh --style` previews one.

## 1.0.0
- First release: tokens, 17 references, localhost playground, contrast checker; Claude Code and Codex plugins.
