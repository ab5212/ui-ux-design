# Changelog

Bump `version` in **both** plugin manifests for every release; users only receive updates when it changes.

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
