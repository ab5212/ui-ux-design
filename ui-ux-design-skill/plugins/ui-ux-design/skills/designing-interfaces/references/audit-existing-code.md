# Auditing existing front-end code

When the user already has UI code, don't rewrite it. Find what is worth changing, show it as choices, and change only what they approve.

## Contents
- When to use this
- Step 1: scan
- Step 2: read what matters
- Step 3: propose, as choices
- Step 4: apply only what was approved
- Step 5: verify and report
- Where styles live, by stack
- Rules of engagement

---

## When to use this

- "Review / improve / clean up / modernize / polish this UI."
- "Make it accessible / responsive / consistent / dark-mode ready."
- A bug report about layout, contrast, focus or mobile behavior.
- Any UI task in Project mode that touches code that already exists.

Not for building something new (`direction.md`) or converting a picture (`screenshot-to-code.md`).

## Step 1: scan

Run the audit script on the project root (or the folder in question):

```bash
node <this-skill-dir>/scripts/audit-frontend.mjs .            # readable report
node <this-skill-dir>/scripts/audit-frontend.mjs . --json     # structured, for your own grouping
```

It scans HTML, CSS, Sass, Less, JS/TS/JSX/TSX, Vue, Svelte, Astro, Angular templates and common server templates, and skips `node_modules` and build output. It is a pattern scanner. Findings marked "verify" may be false positives.

No Node or shell? Search by hand for the same patterns: `user-scalable`, `outline: none`, `<img` without `alt`, `onClick` on `div`/`span`, `<a` without `href`, `tabindex="[1-9]"`, `100vh`, fixed widths of 600px or more, `font-size` under 12px, hardcoded colors, `z-index` of four digits, `transition: all`, and whether `prefers-reduced-motion` appears anywhere.

In Chat mode the user pastes code, so read it directly against `review-checklist.md`.

## Step 2: read what matters

The scan finds places; you decide what they mean.

1. Open the files with the most findings and the shared layout, navigation and form components.
2. Find the token or theme file, if any. A project with tokens needs different advice from one without.
3. Run the contrast script on the token file if there is one (`scripts/check-contrast.mjs`).
4. Check the things a scanner can't see: keyboard operation of menus and dialogs, focus order, what happens at 320px, long text, empty and error states, dark mode.
5. Look at the stack's idioms before suggesting changes. Suggest fixes in the project's own style (its component library, its CSS approach).

Drop false positives. Merge duplicates. Be able to say, for each item you propose, why it matters to a real user.

## Step 3: propose, as choices

Present findings as a **numbered list of changes the user can accept or skip**, grouped and ordered by value. Don't dump the raw report. Each item says what changes, where, why it matters, how big it is, and what could break.

Format:

```
I looked through 38 files (React, Tailwind v4). Nothing has been changed yet.

A. Accessibility, 3 fixes (2 are blockers)
  1. [blocker] Pinch-zoom is disabled in index.html. Remove maximum-scale. 1 line, no risk.
  2. [blocker] 4 images have no alt text (Hero, Team ×3). I'd write alt text from context; you review it. 4 files.
  3. [major] 6 clickable <div>s in the table and menu. Convert to <button>; keeps current styles. 5 files, low risk.

B. Responsive, 2 fixes
  4. [major] The pricing table is 900px wide and overflows phones. Scroll inside its own container with a shadow cue. 1 file.
  5. [minor] h-screen on the login page hides the button under the mobile address bar. Use min-h-dvh. 1 line.

C. Consistency, 1 fix
  6. [minor] 48 hardcoded colors. Move the 9 distinct ones into tokens. Touches 14 files; I'd do it as a separate pass.

Which should I apply? Reply with numbers ("1,2,3"), a group ("all of A"), "all blockers", "everything", or "none". Or tell me what to skip or change.
```

Rules for the list:

- **Order:** blockers first, then by user impact, then by effort.
- **Group into three to five groups** so the user can answer in one line.
- **Offer a default:** "I'd start with A and B; they're small and safe."
- **Say what you did not look at** (backend rendering, third-party widgets, features behind login).
- **Use your interactive question tool** if you have one: one multi-select question per group, or a single "which groups?" question with the options Accessibility, Responsive, Consistency, Polish. Otherwise send the list and **stop and wait**.
- **Don't offer a rewrite** unless the code is beyond repair. Say so plainly if it is, and why.

Never start editing while the question is open. The exception is when the user already said "just fix everything"; in that case still list what you changed.

## Step 4: apply only what was approved

- **Do exactly the approved items.** No drive-by refactors, formatting sweeps or dependency upgrades. Mention extra problems you noticed at the end as new proposals.
- **Match the project:** its naming, file layout, component library, CSS approach and formatting. Extend its existing tokens; don't add a parallel set.
- **Small, reviewable steps.** One concern per commit if you commit. If the working tree has uncommitted changes, say so first and suggest a branch.
- **Don't touch** generated files, vendored code, lockfiles or build output.
- **Keep behavior identical** unless the item is about behavior. A `<div onClick>` becomes a `<button>` that looks the same and does the same.
- **When an approved fix needs a decision** (alt text, a button label, which color becomes which token), propose the value and let the user adjust it. Don't guess silently.

## Step 5: verify and report

1. Run the project's build, type-check, lint and tests. Fix what you broke.
2. Re-run `audit-frontend.mjs` and show the before and after counts.
3. Render or describe the checks at 360, 768 and 1280px, light and dark, and with the keyboard only. Say which you actually ran.
4. Report in four lines: **changed** (what and where), **not changed** (skipped items and why), **found while working** (new proposals), **how to check it** (what the user should look at).

## Where styles live, by stack

| Stack | Look in |
|---|---|
| Plain HTML/CSS | `*.css`, `<style>` blocks, inline `style=` |
| Tailwind | class lists in templates; `tailwind.config.*` (v3) or `@theme` in CSS (v4) |
| React / Next | `.tsx`/`.jsx` class names, CSS Modules (`*.module.css`), styled-components or Emotion template literals, `globals.css` |
| Vue / Nuxt | `<style scoped>` in `.vue`, `assets/`, `nuxt.config` `css` |
| Svelte / SvelteKit | `<style>` in `.svelte`, `app.css` |
| Angular | component `styles`/`styleUrls`, `styles.css`, `angular.json` `styles`, Angular Material theme |
| Astro | `<style>` in `.astro`, layouts |
| Server templates (PHP, Rails, Django, Laravel, Liquid) | template files plus the CSS they load; check the base layout first |
| Bootstrap or another CSS framework | variable overrides, a custom Sass file, then component markup |

## Rules of engagement

- **No surprises:** nothing changes before the user picks.
- **Evidence over opinion:** point to the file and line, name the rule, show the fix.
- **Respect what works:** don't restyle a consistent, working design to match these defaults. Fix users' problems, not your preferences.
- **Be honest about limits:** a scan plus a read is not an accessibility audit. Recommend a keyboard pass, a screen reader pass and axe in CI for anything public.
