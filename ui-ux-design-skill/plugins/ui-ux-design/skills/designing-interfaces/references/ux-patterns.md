# UX principles and patterns

## Contents
- Beginner: Nielsen's 10 heuristics as developer checks
- Laws of UX that change code decisions
- Information architecture
- Forms UX
- Microcopy and errors
- Loading, performance and perceived speed
- Onboarding
- Feedback, undo and destructive actions
- Settings and preferences
- Expert: cognitive load, dark patterns to refuse

---

## Beginner: Nielsen's 10 heuristics as developer checks

| # | Heuristic | What to check in your build |
|---|---|---|
| 1 | Visibility of system status | Every action produces visible feedback within 100ms; loading, saving and syncing states exist |
| 2 | Match the real world | Labels use the user's words ("Invoices"), not the database's ("billing_docs") |
| 3 | User control and freedom | Undo, cancel, back and close exist; dialogs close with Esc; multi-step flows let users go back |
| 4 | Consistency and standards | The same action has the same name and position everywhere; platform conventions (logo → home, ⌘K, Esc) work |
| 5 | Error prevention | Constrained inputs (pickers, masks, sensible defaults); confirm or offer undo for destructive actions; disable impossible options with an explanation |
| 6 | Recognition rather than recall | Show options instead of making users type them; keep context visible across steps; show recent items |
| 7 | Flexibility and efficiency | Keyboard shortcuts, bulk actions, saved filters, a command palette for power users, without burdening beginners |
| 8 | Aesthetic and minimalist design | Every element earns its place; secondary information is demoted, not deleted |
| 9 | Help users recover from errors | Errors in plain language, next to the cause, with the fix |
| 10 | Help and documentation | Contextual help (inline hints, empty-state links), searchable docs, help in a consistent place |

## Laws of UX that change code decisions

| Law | Implication |
|---|---|
| **Fitts's law:** time to hit a target depends on its size and distance | Big targets for frequent actions; put primary actions near where attention already is; screen edges are easy targets on desktop; the bottom of the screen is easiest to reach on phones |
| **Hick's law:** decision time grows with the number of choices | Fewer options per screen; group and progressively disclose; highlight a recommended choice |
| **Jakob's law:** users expect your site to work like the others they know | Use conventional patterns (cart top-right, search with a magnifier, logo links home) unless you have evidence otherwise |
| **Miller's law (chunking)** | Break long numbers and codes into chunks (`4821 9934 1022`); group form fields. Don't read it as "menus must have 7 items" |
| **Doherty threshold:** productivity soars when responses come in under 400ms | Optimistic updates, skeletons, prefetching on hover/intent |
| **Tesler's law:** complexity can't be removed, only moved | The system should absorb it (smart defaults, auto-detection), not the user |
| **Postel's law:** accept liberal input, produce strict output | Accept "+1 (555) 010-0000", "5550100000" and "555 010 0000"; normalize on the server |
| **Von Restorff effect:** the different thing is remembered | Exactly one visually distinct primary action; use emphasis sparingly or it stops working |
| **Serial position effect** | Put the most important navigation items first and last |
| **Peak-end rule:** experiences are judged by their peak and their end | Invest in success screens, confirmations and the final step of flows |
| **Goal-gradient effect:** motivation rises near completion | Show progress in multi-step flows; start progress bars partly filled when steps were already done |
| **Aesthetic-usability effect** | Polished UIs are perceived as easier to use. Polish hides usability problems in tests too, so test with real tasks |

## Information architecture

- **Organize by user tasks and mental models**, not by your org chart or data model. Card sorting with 5–15 users reveals the groupings.
- **Navigation labels are nouns** for places ("Projects", "Billing") and verbs for actions ("Create project").
- **Depth vs breadth:** 5–9 top-level items with shallow depth is easier than 3 items that hide everything two levels down.
- **Every screen answers:** Where am I? (title, active nav, breadcrumbs) What can I do here? (visible primary action) Where can I go? (navigation, related links)
- **URLs reflect structure** and state (filters, tabs, pagination in the query string), so back, refresh and sharing work.
- **Search** for more than about 50 items or content-heavy products; scope it clearly ("Search projects").

## Forms UX

- **Ask less.** Every field costs completion. Remove fields you don't use, defer optional ones until after signup, and derive what you can (city from postcode).
- **One column.** Multi-column forms cause skipped fields and zig-zag scanning. Exceptions: short related pairs (first/last name, city/postcode) on wide screens.
- **Order like a conversation:** easy questions first, sensitive ones (payment, phone) last.
- **Defaults** for the most common answer, but not for consent or legally significant choices.
- **Input masks** only where the format is fixed (card numbers, dates); let users type freely and format on blur.
- **Show progress** in flows longer than one screen ("Step 2 of 3"), and let users save and return in long ones.
- **Success:** say what happened and what happens next ("Order placed. A confirmation is on its way to sam@example.com.").
- Field-level rules are in `components-forms.md`.

## Microcopy and errors

**Voice:** clear, specific, calm. Plain verbs, sentence case, no filler, no blame, no exclamation marks in errors.

| Element | Rule | Example |
|---|---|---|
| Buttons | Verb + object; keep the verb through the flow | "Publish post" → toast "Post published" |
| Headings | Describe the content or task | "Payment method", not "Let's get you set up!" |
| Empty states | What it is + what to do | "No invoices yet. Invoices appear here after your first sale." |
| Errors | What happened + how to fix | "Card declined. Try another card or contact your bank." |
| Confirmations | Name the object and consequence | "Delete 'Q3 report'? This can't be undone." |
| Destructive buttons | Repeat the verb | "Delete report", not "OK" |
| Links | Describe the destination | "Read the refund policy", not "Click here" |
| Tooltips | Add information, don't repeat the label | Icon "⋯" → "More actions" |
| Placeholder | Example format only | "name@example.com" |

- Name things by what users manage, not how the system is built: "Notifications", not "Webhook config".
- Prefer specific numbers and times: "Saved 2 minutes ago", "3 of 5 seats used".
- Write for scanning: front-load the key words; headings and buttons should make sense out of context.
- Avoid humor in errors and in anything about money, security or loss.

## Loading, performance and perceived speed

| Response time | Perception | Do |
|---|---|---|
| < 100ms | Instant | Nothing extra; just respond |
| 100ms–1s | A delay, but flow is kept | Subtle inline feedback after 300ms |
| 1–10s | Attention starts to wander | Skeleton or spinner with a label |
| > 10s | Users switch tasks | Determinate progress, time estimate, cancel, run in background |

- **Optimistic UI** for likely-to-succeed, reversible actions.
- **Prefetch** on hover or viewport entry for likely next pages.
- **Keep the layout stable** while loading: reserve space for images, ads, embeds and async content (Cumulative Layout Shift under 0.1).
- **Don't block the whole page** for one slow widget; load sections independently.
- **Core Web Vitals targets:** LCP < 2.5s, INP < 200ms, CLS < 0.1.

## Onboarding

- **Get users to value fast.** The first session should end with the user having done the core thing once, not having read about it.
- Prefer **empty states with one clear action**, **templates and sample data**, and **contextual tips** at the moment of need over upfront product tours. Tours are skipped and forgotten.
- A **checklist** (3–5 items, dismissible, with visible progress) works for products with several setup steps.
- Ask setup questions only if the answers change what users see next.
- Never block the product behind a tour or a modal sequence. Always allow skipping.

## Feedback, undo and destructive actions

- **Every action gets feedback:** a visual state change, an inline message or a toast. Silence reads as failure.
- **Undo beats confirmation** for frequent, recoverable actions (archive, delete from a list, move): act immediately, offer undo for 5–10s, soft-delete on the server.
- **Confirm** only irreversible, high-impact actions (delete account, cancel subscription, publish to everyone), and make the confirmation specific.
- **Disabled states explain themselves** (helper text, or an enabled button that explains on click), or hide actions the user can never take.
- **Autosave** long-form content; show "Saving…" → "Saved" and warn before leaving with unsaved changes (`beforeunload` only when there really are unsaved changes).

## Settings and preferences

- Group settings by user intent (Profile, Notifications, Security, Billing), with search for more than about 20 settings.
- Switches for settings that apply immediately (show a brief "Saved" confirmation); a form with Save/Cancel for settings that need review together.
- Show the current value next to each setting; describe consequences under the label.
- Put dangerous settings (delete workspace, transfer ownership) in a separate "Danger zone" section at the bottom with destructive styling.

## Expert: cognitive load, dark patterns to refuse

### Reducing cognitive load

- **Progressive disclosure:** basic options visible, advanced ones behind "Advanced settings". Keep the advanced state remembered.
- **Smart defaults** pre-select the choice most users make; show that it can be changed.
- **Chunk** long tasks into steps; long pages into sections with clear headings and a table of contents.
- **One primary action per screen;** demote everything else visually.
- **Consistency** is a cognitive-load tool: once users learn one pattern, every reuse is free.

### Dark patterns to refuse

Developers are often asked to build these. Push back. They erode trust and are increasingly illegal (EU Digital Services Act, consumer protection rules, FTC enforcement).

| Pattern | Example | Instead |
|---|---|---|
| Confirmshaming | "No thanks, I prefer paying full price" | Neutral decline: "No thanks" |
| Roach motel | Easy signup, cancellation only by phone | Cancel in the same channel and number of steps as signup |
| Hidden costs | Fees revealed at the last checkout step | Show the full price early |
| Pre-checked consent | Marketing boxes checked by default | Unchecked, opt-in |
| Disguised ads | Ads styled as content or navigation | Clearly labeled sponsored content |
| Fake urgency | Countdown timers that reset | Real deadlines only |
| Nagging | Repeated permission prompts after "no" | Respect the decision; re-ask only on a relevant action |
| Obstruction in cookie banners | "Accept" prominent, "Reject" buried | Equal-weight Accept and Reject buttons |
