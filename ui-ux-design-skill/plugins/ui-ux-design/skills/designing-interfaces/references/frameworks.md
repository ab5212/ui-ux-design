# Output technologies: HTML, CSS and every common front-end stack

The design rules in this skill are about the interface, not the framework. This file translates them into each technology. The tokens are CSS custom properties, so they work everywhere.

## Contents
- The universal baseline: plain HTML + CSS
- Tailwind class → CSS translation
- Choosing and setting up a target
- The same button in each stack
- Per-stack notes
- Out of scope

---

## The universal baseline: plain HTML + CSS

Anything you can build in a framework you can first express in plain HTML and CSS. Use this as the default output when the user doesn't name a stack, and as the reference when translating.

| File | What it is |
|---|---|
| `assets/tokens.plain.css` | All design tokens as CSS variables, light and dark. No build step. |
| `assets/plain/components.css` | Buttons, forms, cards, badges, alerts, table, navbar, dialog. Uses only tokens. |
| `assets/plain/example.html` | A complete, accessible, responsive page using both. Start from it. |

```html
<link rel="stylesheet" href="tokens.plain.css">
<link rel="stylesheet" href="components.css">
```

- **Single-file output** (chat answers): paste both stylesheets into one `<style>` block, then your page rules. In Chat mode use `references/starter-css.md`.
- **Theme:** toggle `class="dark"` on `<html>`; the inline script in `example.html` applies the saved or system theme before first paint.
- **Behavior without a framework:** `<dialog>` + `showModal()` for modals, `<details>`/`<summary>` for disclosure, the `popover` attribute for popovers, `aria-expanded` and a few lines of JavaScript for menus.
- **Rebrand:** change `--brand-h`.

## Tailwind class → CSS translation

Most snippets in the other references use Tailwind. Translate them like this.

| Tailwind | CSS |
|---|---|
| `p-4`, `px-4`, `gap-4` | `padding: 1rem`, `padding-inline: 1rem`, `gap: 1rem` (the unit is 0.25rem: `-2` = 0.5rem, `-3` = 0.75rem, `-6` = 1.5rem, `-8` = 2rem) |
| `text-sm` / `text-base` / `text-lg` | `font-size: .875rem; line-height: 1.25rem` / `1rem; 1.5rem` / `1.125rem; 1.75rem` |
| `text-xl` / `text-2xl` / `text-3xl` | `1.25rem; 1.75rem` / `1.5rem; 2rem` / `1.875rem; 2.25rem` |
| `font-medium` / `font-semibold` | `font-weight: 500` / `600` |
| `rounded-md` / `-lg` / `-xl` / `-2xl` | `border-radius: var(--radius-md)` … `var(--radius-2xl)` |
| `shadow-sm` / `-md` / `-lg` | `box-shadow: var(--shadow-sm)` … |
| `bg-primary text-primary-foreground` | `background: var(--primary); color: var(--primary-foreground)` |
| `border border-input` | `border: 1px solid var(--input)` |
| `h-(--control-h-md)` | `height: var(--control-h-md)` |
| `sm:` `md:` `lg:` `xl:` | `@media (min-width: 640px)` / `768px` / `1024px` / `1280px` |
| `dark:` | `.dark &` selector |
| `hover:` | `@media (hover: hover) { &:hover { … } }` |
| `focus-visible:outline-2 outline-ring outline-offset-2` | `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px }` |
| `min-h-dvh` | `min-height: 100dvh` |
| `truncate` | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |
| `sr-only` | the `.sr-only` rule in `components.css` |
| `grid grid-cols-1 sm:grid-cols-2` | `display: grid; grid-template-columns: 1fr` then `repeat(2, minmax(0, 1fr))` at 640px |
| `ms-*` / `ps-*` / `text-start` | `margin-inline-start` / `padding-inline-start` / `text-align: start` |

## Choosing and setting up a target

| Target | Tokens | Component approach | Accessible primitives |
|---|---|---|---|
| HTML + CSS | `tokens.plain.css` | `components.css` | native elements |
| HTML + Tailwind v4 | `tokens.css` | utility classes + `@theme inline` | native elements |
| Tailwind v3 | `:root`/`.dark` from `tokens.css` + the config in `tokens.md` | utility classes | native elements |
| React / Next.js | either file | the `cva` button pattern in `components-actions.md` | Radix UI, React Aria, Headless UI |
| Vue / Nuxt | `tokens.plain.css` or Tailwind | SFC with scoped styles or classes | Reka UI (formerly Radix Vue), Headless UI Vue |
| Svelte / SvelteKit | `tokens.plain.css` or Tailwind | `.svelte` with scoped styles | Bits UI, Melt UI |
| Angular | `tokens.plain.css` in `styles` | standalone components | Angular CDK (`a11y`, `overlay`) |
| Astro | global CSS import | `.astro` components; islands only when interactive | native elements; framework primitives in islands |
| Solid | either | components with classes | Kobalte |
| Web components (Lit) | custom properties inherit into shadow DOM | `static styles` | native elements inside the shadow root |
| Bootstrap | see below | Bootstrap markup + overrides | Bootstrap's own, plus native |
| Server templates (PHP, Rails, Django, Laravel, Jinja, Twig, Liquid) | `tokens.plain.css` | `components.css` in the base layout | native elements; htmx or Alpine for small behavior |

Always follow the user's existing component library and conventions when there is one (`SKILL.md`, Step 1).

## The same button in each stack

Same tokens, same states, same markup rules: a real `<button>`, `type="button"`, a visible focus ring, loading shown with `aria-busy`.

**HTML + CSS**

```html
<button class="btn btn-secondary btn-sm" type="button">Export</button>
<button class="btn" type="submit" aria-busy="true" disabled>Saving</button>
```

**Vue 3 (single-file component)**

```vue
<script setup lang="ts">
withDefaults(
  defineProps<{ variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive"; size?: "sm" | "md" | "lg"; loading?: boolean }>(),
  { variant: "primary", size: "md", loading: false }
);
</script>

<template>
  <button
    type="button"
    class="btn"
    :class="[`btn-${variant}`, size !== 'md' && `btn-${size}`]"
    :disabled="loading"
    :aria-busy="loading ? 'true' : undefined"
  >
    <slot />
  </button>
</template>
```

**Svelte 5** (Svelte 4 uses `export let` and `<slot />`)

```svelte
<script lang="ts">
  let { variant = "primary", size = "md", loading = false, children, ...rest } = $props();
</script>

<button
  type="button"
  class="btn btn-{variant}"
  class:btn-sm={size === "sm"}
  class:btn-lg={size === "lg"}
  disabled={loading || rest.disabled}
  aria-busy={loading ? "true" : undefined}
  {...rest}
>
  {@render children?.()}
</button>
```

**Angular** (standalone component)

```ts
import { Component, Input } from "@angular/core";
import { NgClass } from "@angular/common";

@Component({
  selector: "app-button",
  standalone: true,
  imports: [NgClass],
  template: `
    <button [type]="type" class="btn" [ngClass]="classes" [disabled]="disabled || loading" [attr.aria-busy]="loading ? 'true' : null">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: "primary" | "secondary" | "outline" | "ghost" | "destructive" = "primary";
  @Input() size: "sm" | "md" | "lg" = "md";
  @Input() type: "button" | "submit" = "button";
  @Input() disabled = false;
  @Input() loading = false;

  get classes() {
    return [`btn-${this.variant}`, this.size === "md" ? "" : `btn-${this.size}`];
  }
}
```

**Web component (Lit).** Styles don't cross the shadow boundary, but custom properties do, so tokens work without copying `components.css`.

```js
import { LitElement, html, css } from "lit";

export class UiButton extends LitElement {
  static properties = { loading: { type: Boolean } };
  static styles = css`
    button {
      height: var(--control-h-md);
      padding-inline: 1rem;
      border: 0;
      border-radius: var(--radius-md);
      background: var(--primary);
      color: var(--primary-foreground);
      font: inherit;
      font-weight: 500;
      cursor: pointer;
    }
    button:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
  `;
  render() {
    return html`<button part="button" ?disabled=${this.loading} aria-busy=${this.loading ? "true" : "false"}><slot></slot></button>`;
  }
}
customElements.define("ui-button", UiButton);
```

React with `cva` is in `components-actions.md`.

## Per-stack notes

**Plain HTML/CSS and server-rendered templates**
- Put `tokens.plain.css` and `components.css` in the base layout. Every page then inherits the theme.
- Forms post normally; validate on the server, and show errors with `aria-describedby` and `aria-invalid` (`components-forms.md`).
- Progressive enhancement: the page must work before JavaScript runs. htmx or Alpine are fine for small behavior.

**Tailwind**
- v4: CSS-first config. Raw values in `:root`/`.dark`, mapped with `@theme inline` (`tokens.md`). v3: `tailwind.config.js` maps to the same variables.
- Build class names as complete strings. `rounded-${size}` is not found by the scanner; use a lookup of full class names.

**React and Next.js**
- Interactive components need a client boundary in the App Router (`"use client"`); keep layouts and static sections as server components.
- Prevent the dark-mode flash with an inline script in `<head>`, and `suppressHydrationWarning` on `<html>`, or use a small theme library.
- Prefer Radix UI, React Aria or Headless UI for menus, dialogs, tabs and comboboxes; don't hand-roll focus traps.

**Vue and Nuxt**
- Scoped styles can read tokens: `background: var(--surface)`. Register global CSS in `nuxt.config` (`css: [...]`).
- Use `v-model` on native inputs with a real `<label for>`; `defineProps` for variants as above.

**Svelte and SvelteKit**
- Import tokens once in `+layout.svelte` or `app.css`. Component styles are scoped by default, so reference tokens, not class names from elsewhere.
- Svelte 5 uses runes (`$props`, `$state`) and snippets; Svelte 4 uses `export let` and slots. Match the project's version.

**Angular**
- Add the token file to `styles` in `angular.json` (or import it from `styles.css`). Use `ViewEncapsulation` defaults; tokens pass through.
- Angular CDK provides focus trapping, live announcements and overlays; use it instead of custom code. Angular Material exposes its theme as CSS variables you can map to tokens.

**Astro**
- Ship zero JavaScript by default. Add `client:*` directives only to components that need interaction, and keep everything else static HTML.

**Bootstrap**
- Bootstrap utilities use RGB-channel variables (for example `--bs-primary-rgb`), which OKLCH tokens can't supply. Either compile Bootstrap with Sass variables set to hex equivalents of your palette, or keep Bootstrap for grid and layout and use `components.css` for the visual components.
- Check contrast of the resulting palette; Bootstrap's defaults don't all pass AA.

**CSS-in-JS** (styled-components, Emotion, vanilla-extract, Panda): reference `var(--token)` inside styles; keep the tokens in one global stylesheet so theming stays a variable swap and server rendering doesn't flash.

**Sass and Less:** don't convert tokens to `$variables`; they can't change at runtime, which breaks dark mode and rebranding. Use `var()` and keep mixins for structure only.

**jQuery and legacy pages:** apply the CSS kit; replace click handlers on `div`s with buttons; add labels and alt text. Behavior can stay as is.

## Out of scope

- **Email HTML.** It needs table layout and inline styles for client compatibility. The tokens (colors, type scale, spacing) still apply; the component CSS doesn't.
- **Native mobile apps** (SwiftUI, Jetpack Compose, Flutter, React Native). The principles carry over: type scale, spacing, contrast, states, touch targets. Use the platform's own guidelines (Apple Human Interface Guidelines, Material) for components and navigation.
- **Game and canvas UIs.**

Say so plainly if asked, and offer the web or design-principle parts that do apply.
