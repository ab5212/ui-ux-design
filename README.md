# designing-interfaces

An agent skill, packaged as a plugin, that gives AI assistants the judgment of a senior product designer for **any web front-end**: HTML and CSS, Tailwind, React, Vue, Svelte, Angular, Astro, Bootstrap, server templates.

- **It asks before it builds.** Which look, which framework, what to change. It never picks your visual style silently.
- **Screenshot to code.** Give it a screenshot or mockup and it asks what you want done with it, then returns HTML, CSS or your framework of choice.
- **Audits existing code.** It scans your project, shows the problems as numbered choices, and changes only what you approve.
- **Real design rules, not vibes:** tokens, type scale, color and dark mode, concentric radius, component specs, responsive layouts from 320px phones to ultrawide, WCAG 2.2 AA.
- **A live playground on localhost** to preview a style before you commit to it.

## Where it works

| Where | How | Status |
|---|---|---|
| **Claude Code** | Plugin | Install, update and validation tested |
| **OpenAI Codex** | Plugin | Install tested |
| **Gemini CLI** | Copy the skill to `.gemini/skills/` or `.agents/skills/`, or `gemini skills install <url>` | Per Gemini CLI docs; not tested |
| **ChatGPT** (web, desktop, mobile) | Upload the chat package as a skill, select it with `@` | Per OpenAI docs; upload path not tested |
| **Claude.ai, Claude Desktop** | Upload the chat package as a custom skill | Per Anthropic docs; not tested |
| **Gemini app** | Chat package, or paste the instructions into a Gem | Reported to reject skills with scripts, so use the chat package; not tested |
| **Custom GPT, Gem, Claude Project** | Paste `paste-instructions.md` | Works anywhere with an instructions field |
| **Cursor, Windsurf, Copilot** | Use the paste file as rules / `AGENTS.md` | Not tested |

Platform features change quickly. Confirm against each vendor's current documentation.

### What changes by environment

| | Coding agent (Project mode) | Chat app (Chat mode) |
|---|---|---|
| Sees your code | Yes | Only what you paste |
| Existing code | Scans it, proposes numbered changes, **asks which to apply** | Reviews what you paste, asks what you want |
| Screenshot | Asks what to do and which look, then writes into your project | Asks what to do, which look and which language, then gives you a complete file |
| Output | Files in your project, in its own conventions | One runnable file, or each file under its path |
| Tools | Audit script, contrast checker, localhost playground | None; the rules and starter CSS are built in |

## Install as a plugin (Claude Code and Codex)

Replace `<owner>/<repo>` with this repository's GitHub path. The same repo is a marketplace for both tools.

### Claude Code

```bash
claude plugin marketplace add <owner>/<repo>
claude plugin install ui-ux-design@ui-ux-design
```

Or inside a session: `/plugin marketplace add <owner>/<repo>`, then `/plugin install ui-ux-design@ui-ux-design`. Run `/reload-plugins` or restart. To share it with your team, add `--scope project`. The skill appears namespaced as `ui-ux-design:designing-interfaces` and also loads automatically when a task involves UI.

### OpenAI Codex

```bash
codex plugin marketplace add <owner>/<repo>
codex plugin add ui-ux-design@ui-ux-design
```

Check with `codex plugin list`.

### Update

```bash
claude plugin marketplace update ui-ux-design && claude plugin update ui-ux-design@ui-ux-design
codex plugin marketplace upgrade ui-ux-design      # Git-backed marketplaces
```

Versions are pinned by the `version` field in the manifests, so users get an update only when it changes (see `CHANGELOG.md`).

**Get updates automatically (Claude Code).** Auto-update is off by default for third-party marketplaces. Turn it on once: run `/plugin`, open **Marketplaces**, select `ui-ux-design` and switch on **Enable auto-update**. Claude Code then checks in the background at startup and shows `Plugin updated: ui-ux-design · Run /reload-plugins to apply`; the new version also loads on the next launch. Teams and admins can pre-enable it for everyone with `extraKnownMarketplaces` and `autoUpdate: true` in managed settings. A marketplace cannot turn auto-update on for users or push them a notice, so announce releases here and on the GitHub Releases page.

**After a plugin update, refresh your playground.** The playground is a copy, so run the `--update` command in "Updating an existing playground" below.

## Install as a plain skill (any agent that reads `SKILL.md`)

```bash
# Claude Code: one project, or all projects
mkdir -p .claude/skills && cp -r plugins/ui-ux-design/skills/designing-interfaces .claude/skills/
mkdir -p ~/.claude/skills && cp -r plugins/ui-ux-design/skills/designing-interfaces ~/.claude/skills/

# Codex and Gemini CLI (both read .agents/skills/)
mkdir -p .agents/skills && cp -r plugins/ui-ux-design/skills/designing-interfaces .agents/skills/
mkdir -p ~/.agents/skills && cp -r plugins/ui-ux-design/skills/designing-interfaces ~/.agents/skills/
```

Restart the agent after installing.

## Install in a chat app

Chat apps can't run scripts or read project folders, and some limit what a skill may contain. The **chat edition** is the same guidance with a short description (Claude.ai allows 200 characters), no scripts, and the starter CSS inlined as text.

```bash
bash plugins/ui-ux-design/skills/designing-interfaces/scripts/build-chat-package.sh ./dist
# → dist/designing-interfaces-chat.zip   (SKILL.md at the zip root)
```

Upload `designing-interfaces-chat.zip` as a custom skill in ChatGPT, Claude.ai or the Gemini app.

For a **Custom GPT, Gem, Claude Project** or any product with an instructions field and no skill upload, paste the contents of `plugins/ui-ux-design/skills/designing-interfaces/assets/chat/paste-instructions.md` (about 7,000 characters).

Then send a screenshot. It asks what you want before generating anything.

## How it behaves

**A screenshot arrives.** It does not generate. It asks what to do (recreate it, polish it, redesign it, review only, change something specific), which look if you want a redesign, and the output technology. Then it reads the image top to bottom, maps colors and type to tokens, and builds. If the screenshot breaks accessibility (low contrast, tiny tap targets, no focus style) it builds the corrected version, tells you what it changed, and offers to match the original.

**You ask it to improve existing code.** It runs the audit, then shows something like this and waits:

```
A. Accessibility, 3 fixes (2 are blockers)
  1. [blocker] Pinch-zoom is disabled in index.html. Remove maximum-scale. 1 line, no risk.
  2. [blocker] 4 images have no alt text. I'd write it from context; you review it.
  3. [major] 6 clickable <div>s. Convert to <button>; same look. 5 files, low risk.
B. Responsive, 2 fixes ...
Which should I apply? "1,2,3", "all of A", "all blockers", "everything", or "none".
```

**You ask for something new with no style.** It asks one short message: look and feel (only styles that fit your product), brand color, main device, and output technology if there is no project. Your answer is applied as a token preset and saved to `DESIGN.md`, so later sessions don't ask again. It skips the questions when `DESIGN.md` exists, you already named a style, the project already has a design language, or the change is small. In a headless run it picks the recommended default, marks it as assumed, and says how to change it.

Styles: clean and minimal (the base tokens), flat, material, soft and friendly, glass, clay, skeuomorphic, bold and raw (neo-brutalism), editorial, monochromatic, color blocking, retro / vintage, minimal vintage, retro-futuristic and art deco. Websites can also add layout techniques (cards, grid, single page, fullscreen hero, typography-led, asymmetrical, illustrative, parallax). Neumorphism is deliberately not offered for controls because its edges fail contrast.

## Output technologies

Plain HTML + CSS (the universal baseline, build-free), Tailwind v3 and v4, React and Next.js, Vue and Nuxt, Svelte and SvelteKit, Angular, Astro, Solid, web components (Lit), Bootstrap, CSS-in-JS, Sass and Less, and server-rendered templates (PHP, Rails, Django, Laravel, Jinja, Twig, Liquid). See `references/frameworks.md`. Out of scope: email HTML and native mobile apps (the principles carry over; use each platform's own guidelines).

## What's inside

```
.claude-plugin/marketplace.json            # Claude Code marketplace catalog
.agents/plugins/marketplace.json           # Codex marketplace catalog
plugins/ui-ux-design/
├── .claude-plugin/plugin.json             # Claude Code manifest
├── .codex-plugin/plugin.json              # Codex manifest
└── skills/designing-interfaces/
    ├── SKILL.md                           # modes, ask-first rules, workflow, defaults, non-negotiables
    ├── references/                        # loaded only when a task needs them
    │   ├── environments.md                # project vs chat mode, what to ask, where it runs
    │   ├── screenshot-to-code.md          # ask, read the image, map to tokens, build, report
    │   ├── audit-existing-code.md         # scan, propose numbered choices, apply only what's approved
    │   ├── frameworks.md                  # HTML/CSS baseline and every stack, tested code samples
    │   ├── direction.md                   # when to ask, the questions, styles, DESIGN.md template
    │   ├── tokens.md  typography.md  color.md  spacing-layout.md  shape-elevation.md  motion.md
    │   ├── responsive.md                  # size classes, navigation per size, touch vs mouse
    │   ├── components-actions.md  components-forms.md  components-overlays.md
    │   ├── components-navigation.md  components-data-display.md
    │   └── accessibility.md  ux-patterns.md  visual-styles.md  review-checklist.md  glossary.md
    ├── assets/
    │   ├── tokens.css                     # Tailwind v4 tokens, light + dark OKLCH
    │   ├── tokens.plain.css               # the same tokens for any stack, no build step
    │   ├── plain/                         # components.css + example.html (plain HTML + CSS kit)
    │   ├── styles/                        # 14 style presets (flat, material, soft, glass, clay, ...)
    │   ├── chat/                          # chat-edition SKILL.md and the single-paste instructions
    │   └── playground/                    # Vite + React + TypeScript + Tailwind v4 + Radix gallery
    └── scripts/
        ├── audit-frontend.mjs             # scans any front-end project for problems
        ├── check-contrast.mjs             # WCAG 2.2 + APCA audit of token files and style presets
        ├── scaffold-playground.sh         # copy the playground, optionally with --style
        └── build-chat-package.sh          # builds the chat-edition zip
```

Both plugin manifests point at the same `skills/` folder, so there is one source of truth.

## Tools

**Audit any front-end project** (no dependencies, Node 18+):

```bash
node plugins/ui-ux-design/skills/designing-interfaces/scripts/audit-frontend.mjs path/to/project
```

Scans HTML, CSS, Sass, Less, JS/TS/JSX/TSX, Vue, Svelte, Astro and common server templates for missing alt text, disabled zoom, removed focus outlines, click handlers on non-interactive elements, missing labels, fixed widths, tiny text, `100vh`, hardcoded colors, motion without reduced-motion handling, and more. It is a pattern scanner: findings marked "verify" can be false positives.

**Check contrast** of a token file, or of a style preset layered on the base:

```bash
node plugins/ui-ux-design/skills/designing-interfaces/scripts/check-contrast.mjs tokens.css [styles/glass.css]
```

Exits 1 if any semantic pair fails WCAG 2.2 AA, and exits 2 if it finds no pairs at all.

**Preview a style on localhost** (Node 20.19+ or 22.12+):

```bash
bash plugins/ui-ux-design/skills/designing-interfaces/scripts/scaffold-playground.sh ./ui-playground --style glass
cd ui-playground && npm run dev        # http://localhost:5173
```

The playground shows every foundation and component in all states, with theme, density, radius, brand hue, border, shadow, font, text size, spacing and reduced-motion controls, live contrast scores, and a viewport preview at 360, 768, 1024, 1440 and 1920px.

**Updating an existing playground.** A playground is a copy made when you ran the scaffold script, so updating the plugin does not change it. After updating the plugin, run `bash plugins/ui-ux-design/skills/designing-interfaces/scripts/scaffold-playground.sh ./ui-playground --update` (use your playground's folder; the plugin's path under `~/.claude/plugins/cache/` also works). It replaces the app code, keeps your saved Save-to-code choices and `playground-layout.json`, and backs up the old tokens as `src/styles/tokens.css.bak`.

**Edit any color or font.** The Colors group lists every semantic color with pickers for the fill and its text color, live contrast ratios and a per-color reset. Change a fill and the text color switches to white or near-black if the pair drops below 4.5:1. The Font box accepts any Google Font. Colors are edited per theme (light or dark).

**Preview your own app.** Choose **Your app** in the header, enter your dev-server address and add one line to your app's `<head>` while previewing (the playground shows it): `<script src="http://localhost:5173/bridge.js"></script>`. Every color, font and style change then appears in your real pages live. It works when the app uses this skill's color variables, it is dev-only, and the bridge accepts messages only from the playground that served it.

**Dashboard builder.** Pick the grid size (2, 3, 4 or 6 columns), the KPI card style (number, trend, sparkline, icon), then add, drag, reorder, widen and remove widgets (KPI, line chart, bar chart, table, activity, progress). **Save to code** writes `playground-layout.json` next to the tokens file, and the skill builds your dashboard from it.

**Style picker.** The Customize panel starts with a "Look and feel" dropdown listing all 14 presets, so a user can compare styles live. **Save to code** writes the chosen preset and any controls changed on top of it into `src/styles/tokens.css` as a `playground:start` / `playground:end` block of CSS variables. Vite reloads, so an app that imports that file updates live. To update your own tokens file instead, start with `PLAYGROUND_TOKENS=path/to/tokens.css npm run dev`. Dev server only. Components follow `--border-w` only if they use it.

## Sources

The defaults compare and condense guidance from: Material Design 3, Apple Human Interface Guidelines, Microsoft Fluent 2, IBM Carbon, Atlassian Design System, GitHub Primer, Shopify Polaris, GOV.UK Design System, Radix UI and shadcn/ui, Tailwind CSS, WCAG 2.2 and the WAI-ARIA Authoring Practices, Nielsen Norman Group, Laws of UX, and Butterick's Practical Typography. Design systems change between versions; check the official documentation before quoting a value as a system's spec.

## Contributing

Keep `SKILL.md` under 500 lines and references focused on one topic, with concrete values and a stated reason for each rule. Before opening a pull request:

```bash
S=plugins/ui-ux-design/skills/designing-interfaces
claude plugin validate . && claude plugin validate ./plugins/ui-ux-design --strict
for st in $(ls $S/assets/styles | sed 's/\.css$//'); do node $S/scripts/check-contrast.mjs $S/assets/tokens.css $S/assets/styles/$st.css || break; done
node $S/scripts/check-contrast.mjs $S/assets/tokens.plain.css
bash $S/scripts/build-chat-package.sh ./dist
```

Bump `version` in **both** plugin manifests and add a line to `CHANGELOG.md` for every release.

## License

MIT. See [LICENSE](LICENSE).
