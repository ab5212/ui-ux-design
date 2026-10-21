# Review checklist

Use this after building a UI, or when asked to review, audit or improve one. Copy the checklist into your working notes and tick items as you verify them. Report findings by severity.

## Contents
- How to report findings
- Blockers (accessibility and broken behavior)
- Major (responsive, states, consistency)
- Minor (polish)
- "Looks AI-generated": recognize and fix
- Final pass

---

## How to report findings

```
[BLOCKER] src/components/Modal.tsx:42 — Dialog doesn't return focus to its trigger on close.
  Rule: accessibility.md → Focus. Fix: store document.activeElement on open; call .focus() on it in onClose.
```

Order: blockers → major → minor. Fix blockers before anything cosmetic. Don't restyle working parts just to match these defaults when the project has its own consistent decisions.

## Blockers (accessibility and broken behavior)

- [ ] Every interactive element is reachable and operable by keyboard; focus order matches visual order
- [ ] Visible `:focus-visible` style on everything focusable (3:1 contrast), and focus is never hidden under sticky UI
- [ ] Text contrast ≥ 4.5:1 (large ≥ 3:1) in **both** themes; control boundaries and icons ≥ 3:1
- [ ] All inputs have real labels; icon buttons and images have accessible names
- [ ] No `<div onClick>` or `<a>` without `href` acting as buttons
- [ ] Modals trap focus, close on Esc and return focus; background is inert
- [ ] No horizontal page scroll at 320px or at 200% zoom
- [ ] No information or action available only on hover
- [ ] Errors identified in text (not color alone), next to the field, linked with `aria-describedby`
- [ ] Touch targets ≥ 24px everywhere, ≥ 44px on touch layouts
- [ ] Viewport meta present; zoom not disabled
- [ ] Reduced motion honored; nothing flashes more than 3 times per second
- [ ] Forms keep user input after errors; submit isn't silently disabled

## Major (responsive, states, consistency)

**Responsive**
- [ ] Layout checked at 360, 768, 1024, 1440 and 1920 widths, and on a landscape phone
- [ ] Navigation adapts per size class (bottom nav, rail or sidebar; menu drawer on compact sites)
- [ ] Dialogs fit on compact screens (bottom sheet or full screen, `max-h` with scrolling)
- [ ] Tables have a deliberate small-screen pattern
- [ ] `min-h-dvh` instead of `100vh`; safe-area insets on fixed bars
- [ ] Inputs ≥ 16px on mobile; correct `type`, `inputmode`, `autocomplete`
- [ ] Reading widths capped (~65ch) and forms capped (480–640px) on large screens
- [ ] Images have dimensions (no layout shift) and responsive sources

**States**
- [ ] Hover, focus, active, disabled for every control; loading, invalid and selected where relevant
- [ ] Empty, loading, error, no-permission and long-content states exist for every data view
- [ ] Loading feedback matches the wait (none < 300ms, skeleton for known layouts, progress > 10s)
- [ ] Destructive actions have undo or a specific confirmation

**Consistency**
- [ ] No hardcoded colors, radii, shadows, durations or z-indexes in components; all come from tokens
- [ ] One radius family, one depth method (shadow-led or border-led)
- [ ] Spacing values come from the 4px scale; space within groups smaller than between groups
- [ ] One primary button per view or region
- [ ] Same action, same label, same position everywhere
- [ ] Dark mode tuned (not inverted); surfaces lighten with elevation

## Minor (polish)

- [ ] Type scale has clear steps; no more than 3 weights; headings use `text-wrap: balance`
- [ ] Numbers in tables and prices use `tabular-nums` and right alignment
- [ ] Nested radii are concentric (outer = inner + padding)
- [ ] Icons are Material Symbols (one style, one weight) and fonts are Google Fonts (`references/icons-fonts.md`); icons optically aligned with text
- [ ] Truncated text has a way to see the full value
- [ ] Copy: verb + object buttons, sentence case, specific errors, no filler
- [ ] Logical properties used, so RTL works; long translated strings fit
- [ ] Favicon, page titles and social preview images set

## "Looks AI-generated": recognize and fix

These traits aren't wrong in themselves. They read as generated because they appear by default, whatever the product. If the project's direction asks for one, keep it. Otherwise, replace it with a choice made for this product.

| Tell | Why it reads as generated | Fix |
|---|---|---|
| Purple-to-blue gradient hero on white | The default "tech" palette | Derive color from the brand and audience; let a strong photo, product shot or typography carry the hero |
| Every surface a rounded card with the same soft gray shadow | Template kit; no hierarchy | Use cards only for independent items; use spacing, dividers and tints for structure; vary radius by size |
| Centered hero, then three icon cards, then a testimonial row | The default landing-page sequence | Start from the product's most characteristic thing: a live demo, real screenshot, real numbers |
| One default font everywhere at one weight | No typographic decision was made | Choose a typeface for the product's character; build a real scale with weight contrast |
| ALL-CAPS tracked eyebrow label above every heading | Template chrome | Use labels only where they add information |
| Gradient text, glowing blobs, glass cards on plain backgrounds | Decoration without purpose | Remove; spend boldness in one place |
| Emoji as icons; ✨ on AI features | Placeholder look | One consistent icon family |
| Fade-and-slide-up on every section while scrolling | Default motion | Motion only on user actions or one deliberate moment |
| Lorem-style marketing copy ("Unlock your potential", "Seamless", "Supercharge") | Generic language | Specific, concrete copy in the user's words |
| Perfectly even spacing everywhere | No grouping | Apply the proximity rule |
| Numbered markers (01 / 02 / 03) on content that isn't a sequence | Decorative structure | Number only real steps |
| Middle-dot meta strings and arrows on every link ("A · B · C", "Learn more →") | Template punctuation | Plain text; arrows only where navigation direction matters |
| Near-black (#0B0B0B) background with one acid-green or neon accent | The default "dark premium" look | Tint the dark base toward the brand; pick the accent from the brand |
| Cream background with a serif display face and a terracotta accent | Another frequent default | Choose palette and type from the subject matter |
| Identical bento grid of features | Now a template | Use a bento only for heterogeneous content that benefits from it |

**Process that avoids most of these:** settle the direction with the user first (SKILL.md, Step 2). Draft tokens: 4–6 named colors, typefaces and their roles, a layout concept. Then ask: "Would I have produced this plan for any similar product?" Revise whatever is generic before writing code. Spend boldness in one place and keep everything else quiet. Before finishing, remove one decorative element.

## Final pass

1. Screenshot at 390px and 1440px in both themes (or open the playground's viewport switcher) and look at it as a user would.
2. Tab through the main flow once without the mouse.
3. Run `node scripts/check-contrast.mjs` on the token file and an axe scan on the main pages.
4. Read every visible string once, aloud if possible.
