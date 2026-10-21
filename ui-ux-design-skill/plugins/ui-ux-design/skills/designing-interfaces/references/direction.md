# Design direction: ask, don't assume

The visual style is the user's decision, not yours. Most people can't describe a style in words but can pick one from a short list. Choosing silently produces something polished that may be the wrong kind of polished.

## Contents
- The gate: when to ask and when to skip
- How to ask
- The question bank
- Style menu, filtered by product type
- Applying the answer
- Previewing before building
- Recording the decision in DESIGN.md
- When you can't ask

---

## The gate: when to ask and when to skip

Check in this order and stop at the first match.

| # | Situation | Do this |
|---|---|---|
| 1 | `DESIGN.md` exists in the repo root | Read it and follow it. Don't ask again. |
| 2 | A screenshot, mockup or sketch is attached | Go to `screenshot-to-code.md` first; it asks what to do with the image, then returns here for the look and feel if they want a redesign. |
| 3 | The user named a style in this request ("glassmorphism", "flat", "brutalist", "like Linear") | Apply it. Ask only about what is still missing (brand color, device), and only if it would change the result. |
| 4 | The project has an established design language: a token file, a component library, or several existing screens that look consistent | Extend it. Say in one line what you are following ("Following the existing shadcn theme, 8px radius, border-led"). Don't ask about style. |
| 5 | Small change: a bug fix, an accessibility fix, one component that must match its neighbors | Match what's there. Don't ask. |
| 6 | The project has some styling but it is inconsistent | Ask one question: keep the current look and tidy it, or move to a new direction? Then continue at row 7 only if they want a new direction. |
| 7 | **New UI with no established direction:** a new app, a set of pages, a component library, a theme, or a "make it look better/modern/professional" restyle | **Ask before writing any UI code.** |
| 8 | No user to ask (headless or non-interactive run) | Choose the recommended default for the product type, record it as *assumed* in `DESIGN.md`, and say how to change it. |

Never ask about something you can read from the project (framework, Tailwind version, whether dark mode exists) or something the user already told you.

## How to ask

- **One message, at most three questions** in Project mode (the stack comes from the code), **four in Chat mode** (there's no code to read, so output technology is a question too). More feels like a form; fewer leaves gaps.
- **Options, not open questions.** Two to four choices each, with a short plain-language description. Mark one **(recommended)** with the reason in a few words.
- **Always include an escape:** "Not sure, you choose" so beginners aren't stuck.
- **Use your interactive question tool if you have one** (Claude Code's `AskUserQuestion`, for example). Otherwise send a numbered list and **stop** until the user replies. Don't keep building while you wait.
- **Plain words.** Say "soft and rounded", not "elevated tonal surfaces with large corner radii".

## The question bank

Ask only the questions whose answers you don't already have.

**Q1. Look and feel** (always, when the gate says ask). Offer the options from the menu below that fit the product, plus "Not sure, you choose".

**Q2. Brand color.**
- I have one (tell me the hex or the hue)
- Match my existing logo or site (share a link or image)
- Pick one for me based on the product *(recommended)*

**Q3. Where will people mostly use it?**
- On phones, touch first
- On desktop, lots of data and dense screens
- Both equally *(recommended when unsure)*

**Q4. Output technology** (Chat mode, or no project): one HTML + CSS file *(recommended)*, HTML + Tailwind, React, Vue / Svelte / Angular, other. See `environments.md` and `frameworks.md`.

Don't ask about light and dark mode. Default to both, with a toggle that starts from the system setting, and say so in your summary. Ask only if the user raised it.

Example message (a dashboard for a small SaaS team):

> Before I build this, three quick choices. Tell me the numbers, or "you choose".
>
> **1. Look and feel**
> 1. Clean and minimal: thin borders, quiet colors, content first *(recommended for a data-heavy tool)*
> 2. Editorial: big type, sharp corners, hairline rules, very structured
> 3. Soft and friendly: rounded shapes, gentle shadows, warmer
> 4. Bold and raw: thick black borders, hard shadows, loud color
>
> **2. Brand color:** (a) I have one, (b) match my logo or site, (c) pick for me
>
> **3. Main device:** (a) phones, (b) desktop and dense, (c) both equally
>
> I'll use light and dark mode with a toggle unless you say otherwise.

## Style menu, filtered by product type

Offer three or four, not all six. Put the recommended one first.

| Product | Offer, in this order |
|---|---|
| Dashboard, admin, B2B or SaaS tool | Minimal *(rec.)*, Editorial, Soft, Bold and raw |
| Consumer app, community, wellness, finance for individuals | Soft *(rec.)*, Minimal, Clay, Glass |
| Kids, games, playful brand | Clay *(rec.)*, Soft, Bold and raw |
| Developer tool, indie product, creative portfolio | Bold and raw, Minimal *(rec.)*, Editorial |
| Content site, docs, magazine, portfolio | Editorial *(rec.)*, Minimal, Soft |
| Media, entertainment, marketing hero, product with rich imagery | Glass *(rec.)*, Editorial, Minimal |
| Not clear | Minimal *(rec.)*, Soft, Editorial, Bold and raw |

| Name to show | What it feels like | Preset | Watch out for |
|---|---|---|---|
| Clean and minimal | Quiet, precise, tool-like. Solid colors, thin borders. | none (the base `tokens.css`) | Becoming bland: keep clear hierarchy and real affordances |
| Soft and friendly | Warm, approachable. Rounded shapes, gentle shadows, pill buttons. | `styles/soft.css` | Over-rounding dense data screens |
| Glass | Light, airy, layered. Frosted panels floating over a colorful backdrop. | `styles/glass.css` | Contrast depends on what is behind the panel; GPU cost; use for navigation and controls, not body text |
| Clay | Playful, puffy, 3-D pastel shapes. | `styles/clay.css` | Eats space; wrong for dense data UI |
| Bold and raw | Loud, honest, a little rebellious. Thick borders, hard shadows. | `styles/brutalist.css` | Clashing saturated pairs; layout still needs rigorous spacing |
| Editorial | Structured, confident, typographic. Sharp corners, hairlines, big headings. | `styles/editorial.css` | Feels cold with a weak typeface or no accent |

**Neumorphism isn't on the menu.** Its soft-shadow edges fall far below 3:1 (WCAG 1.4.11). If the user asks for it by name, use it only for decorative accents or non-essential widgets, add visible 3:1 borders, and tell them why. See `visual-styles.md`.

## Applying the answer

1. **Tokens.** For a new project: copy `assets/tokens.css`, then append the preset from `assets/styles/` **after** it. Presets redefine every color token in both `:root` and `.dark`, so they are safe to layer. For an existing token set: copy the values into your own tokens by role. Then run `node scripts/check-contrast.mjs assets/tokens.css assets/styles/<name>.css` (or on your merged file).
2. **Brand color.** Set `--brand-h` (0–360). Presets compute lightness and chroma around it. Re-run the contrast check after changing it: yellows, limes and cyans need darker fills.
3. **Components.** The preset sets the mood; you still choose the shapes. Use this table.

| Style | Buttons and inputs | Cards | Depth | Type | Density default |
|---|---|---|---|---|---|
| Minimal | `rounded-md`, 1px borders | `rounded-xl`, border-led | border-led, minimal shadow | one family, 400/500/600 | default |
| Soft | `rounded-full` buttons, `rounded-lg` inputs | `rounded-2xl` | shadow-led, large soft shadows | friendly humanist or rounded sans | comfortable |
| Glass | `rounded-xl`, translucent fills | `rounded-2xl`, `.glass` panels | blur + 1px light border, soft shadow | clean sans, medium weights (thin text fails over blur) | default |
| Clay | `rounded-full`, inner highlights | `rounded-3xl` | inset highlight + soft outer shadow | rounded, heavier weights | comfortable |
| Bold and raw | `rounded-xs`, 2px black border, hard shadow | `rounded-xs`, `border-2` | hard offset shadows, no blur | heavy grotesque or mono headings | default |
| Editorial | `rounded-none`, solid fills | no card boxes; hairline rules and space | none, or hairlines | large tight headings, a distinctive typeface | default or compact |

4. **Still non-negotiable:** contrast, focus rings, 44px touch targets, reduced motion and every rule in `SKILL.md`. A style is paint over the foundations. The glass preset ships its own fallbacks for `prefers-reduced-transparency` and `prefers-contrast`; keep them.

## Previewing before building

When the user picks "Not sure, you choose", or you're torn between two presets, show the real thing rather than describing it:

```bash
bash <this-skill-dir>/scripts/scaffold-playground.sh ./ui-playground --style glass
cd ui-playground && npm run dev   # http://localhost:5173
```

Offer one recommended style first. If they want another, scaffold again into a new folder with a different `--style`. Confirm the choice before you build the real screens.

## Recording the decision in DESIGN.md

Write `DESIGN.md` in the repo root as soon as the direction is settled, so no later session asks again. Keep it short, in this shape:

```md
# Design direction

Decided: 2026-10-20 · by the user   (or: assumed, because no one was available to ask)

- **Product:** internal analytics dashboard for a 20-person ops team
- **Style:** Clean and minimal (base tokens, no preset)
- **Brand:** hue 255 (#2f55c4)
- **Themes:** light and dark, toggle starts from system
- **Primary device:** desktop, dense · density: compact
- **Radius family:** 6px controls, 12px cards · **Depth:** border-led
- **Typeface:** Inter Variable (body and headings)
- **Notes:** no gradients; charts use the categorical palette in tokens.css

To change direction, edit this file and the token file together.
```

When the user later asks for a different look, update `DESIGN.md` and the tokens in the same change.

## When you can't ask

In a headless or non-interactive run, don't block and don't guess silently:
1. Pick the recommended option for the product type from the menu above.
2. Write `DESIGN.md` marked **assumed**, with the reason.
3. End your final message with one line: "I used the *minimal* style, assumed because no one was available to choose. Change it by editing `DESIGN.md` and re-running with another preset."
