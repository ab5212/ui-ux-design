# Motion

## Contents
- Beginner: tokens and the three rules
- Advanced: what to animate, choreography, how systems compare
- Reduced motion
- Expert: springs, View Transitions, scroll-driven animation, performance

---

## Beginner: tokens and the three rules

| Token | Value | Use |
|---|---|---|
| `--duration-instant` | 70ms | Press feedback, checkbox ticks, color changes |
| `--duration-fast` | 120ms | Hover, focus, small toggles, tooltips |
| `--duration-base` | 200ms | Dropdowns, popovers, accordions, most UI |
| `--duration-slow` | 300ms | Dialogs, drawers, sheets |
| `--duration-slower` | 450ms | Large surfaces, full-page transitions |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Things that move from one place to another on screen |
| `--ease-enter` | `cubic-bezier(0, 0, 0, 1)` | Things appearing (fast start, gentle stop) |
| `--ease-exit` | `cubic-bezier(0.3, 0, 1, 1)` | Things leaving (gentle start, fast finish) |

**The three rules**
1. **Motion explains a change.** Where did this panel come from, what got deleted, what is loading. If an animation explains nothing, cut it.
2. **Fast.** Most UI motion is 120–300ms. Anything users trigger repeatedly should feel instant; a 500ms dropdown makes the whole app feel slow.
3. **Only animate `transform` and `opacity`.** They run on the compositor and stay smooth. Animating `width`, `height`, `top`, `margin` or `box-shadow` causes layout or paint work and jank, especially on mobile.

## Advanced: what to animate, choreography, how systems compare

### Recipes

| Element | Enter | Exit |
|---|---|---|
| Dropdown / popover | Fade + scale 0.96→1, from the trigger side, 150–200ms `--ease-enter` | Fade, 100–150ms |
| Dialog | Fade + scale 0.96→1 (or y 8px→0), 200ms; scrim fade 200ms | Fade + scale 0.98, 150ms `--ease-exit` |
| Drawer / sheet | Slide from its edge, 250–300ms `--ease-enter` | Slide back, 200ms `--ease-exit` |
| Toast | Slide + fade from the nearest edge, 200ms | Fade (+ slide), 150ms |
| Accordion | Height via `grid-template-rows: 0fr → 1fr`, 200ms; chevron rotate 200ms | Same, reversed |
| Tooltip | Fade 100ms after the open delay | Fade 75ms |
| Button press | `scale(0.98)` 70ms | Back 120ms |
| List item removed | Fade + collapse height, 200ms | — |
| Skeleton shimmer | 1.5–2s linear, infinite | — |

- **Exits are 20–30% shorter than entrances.** Users have already decided; don't make them wait.
- **Bigger distance or bigger element = longer duration**, within the scale. A tooltip doesn't take 300ms; a full-screen sheet doesn't take 120ms.
- **Animate from the source.** A menu grows from its trigger (`transform-origin` on the trigger side); a dialog opened from a card can grow from that card.
- **Stagger sparingly.** Lists of 3–8 items can stagger by 20–40ms per item. Never stagger more than about 300ms in total, and never on every page load.
- **No decorative motion on load.** Fading and sliding up every section as the page scrolls is the most common "generated site" pattern. One deliberate moment (a hero reveal, a product demo) is enough.

### How systems compare

| System | Durations | Standard easing |
|---|---|---|
| Material 3 | Short 50–200, medium 250–400, long 450–600, extra-long 700–1000ms | Standard `(0.2, 0, 0, 1)`; emphasized decelerate `(0.05, 0.7, 0.1, 1)`, accelerate `(0.3, 0, 0.8, 0.15)` |
| Carbon | 70 / 110 / 150 / 240 / 400 / 700ms | Productive `(0.2, 0, 0.38, 0.9)`; expressive `(0.4, 0.14, 0.3, 1)` |
| Apple | Spring-based by default (SwiftUI), interruptible | Springs with response/damping rather than curves |
| **Recommended** | 70 / 120 / 200 / 300 / 450ms | `(0.2, 0, 0, 1)` standard, separate enter and exit curves |

Carbon distinguishes **productive** motion (efficient, subtle; for apps) from **expressive** motion (more pronounced; for marketing and moments of delight). Use productive by default.

### Tailwind usage

```html
<div class="transition-[opacity,transform] duration-(--duration-base) ease-(--ease-enter)
            data-[state=closed]:opacity-0 data-[state=closed]:scale-96">
```

For CSS-only entry animations on elements that appear (popovers, dialogs), use `@starting-style`:

```css
.popover { transition: opacity var(--duration-base) var(--ease-enter), transform var(--duration-base) var(--ease-enter),
                       display var(--duration-base) allow-discrete, overlay var(--duration-base) allow-discrete; }
.popover:popover-open { opacity: 1; transform: none; }
@starting-style { .popover:popover-open { opacity: 0; transform: scale(.96); } }
```

## Reduced motion

`prefers-reduced-motion: reduce` is set by people who get dizzy or nauseous from motion (vestibular disorders), or who find it distracting. It doesn't mean "no feedback".

| Keep | Replace | Remove |
|---|---|---|
| Opacity fades ≤ 150ms | Slides and zooms → fades | Parallax |
| Color and state changes | Scroll-linked motion → static | Autoplaying video and carousels |
| Spinners and progress (they carry information) | Large transitions → instant | Decorative looping animations |

`tokens.css` sets all durations to 1ms under reduced motion as a safe global default (use 1ms, not 0, so `transitionend` events still fire). For components where a fade still helps, opt back in:

```css
@media (prefers-reduced-motion: reduce) {
  .toast { transition: opacity 120ms linear; transform: none !important; }
}
```

Tailwind variants: `motion-safe:animate-…` and `motion-reduce:transition-none`.

Related WCAG criteria: 2.2.2 (anything that moves automatically for more than 5s needs pause, stop or hide), 2.3.1 (nothing flashes more than 3 times per second), 2.3.3 AAA (animation from interactions can be disabled).

## Expert: springs, View Transitions, scroll-driven animation, performance

- **Springs** feel natural for direct manipulation (drag, swipe, sheets following a finger) because they keep momentum and can be interrupted mid-flight. In React use Motion (`framer-motion`) with `type: "spring"`, around stiffness 400 and damping 30 for UI. Use curves for state changes, springs for gestures.
- **View Transitions API** (`document.startViewTransition`, and cross-document `@view-transition { navigation: auto; }`) animates between page states and routes, including shared elements (`view-transition-name`). Supported in Chromium and Safari, with cross-document transitions in progress elsewhere. Treat it as progressive enhancement and wrap it in a reduced-motion check.
- **Scroll-driven animations** (`animation-timeline: scroll()` / `view()`) run off the main thread. They're good for progress indicators and subtle reveals; disable them under reduced motion.
- **Performance:** use `will-change: transform` only during an animation, not permanently. Avoid animating `filter: blur()` and `backdrop-filter` on large areas on mobile. Measure with DevTools → Performance and look for frames over 16ms.
- **Interruptibility:** a user who clicks "close" during an opening animation should see it reverse from its current position, not snap. CSS transitions do this automatically; keyframe animations don't.
