# Environments and modes: where this skill runs

The same skill is used in coding agents that can edit a project and in chat apps that can only talk. What you can do, and what you must ask, depends on which one you are in.

## Contents
- Detect the mode
- Project mode
- Chat mode
- Ask before generating: the rules for every mode
- Output technology
- Where each platform loads the skill
- When a capability is missing

---

## Detect the mode

| If you can… | You are in |
|---|---|
| Read and write files and run commands in the user's project (Claude Code, Codex, Gemini CLI, Cursor, Windsurf, Copilot agent mode) | **Project mode** |
| Only exchange text and images (ChatGPT, Gemini, Claude.ai chat, Copilot chat, any web or mobile chat) | **Chat mode** |
| See an image the user attached (a screenshot, a mockup, a photo of a sketch) | **Screenshot flow**, in either mode: `screenshot-to-code.md` |

If you have a file or shell tool, you are in Project mode. If you have neither, you are in Chat mode. Don't pretend to read files you can't see: in Chat mode, ask the user to paste what you need.

## Project mode

1. **Read the stack** (SKILL.md, Step 1) and say what you found in one line: "React 19 with Tailwind v4 and shadcn/ui, from `package.json`."
2. **Existing UI code and a request to review, improve, fix, modernize or make it accessible or responsive:** go audit-first. Run the audit, show the findings as choices, and change nothing until the user picks. See `audit-existing-code.md`.
3. **New UI with no established look:** ask for the direction first. See `direction.md`.
4. **Write to files**, in the project's own conventions and folders, not into the chat.
5. **Verify** with the project's own build, lint, tests and dev server. Show what changed and what you left alone.

## Chat mode

You can't see their project, run scripts or sample pixels. Adapt:

- **To review code, ask for it.** "Paste the component, its CSS, and your theme or tokens file. A screenshot of the result helps too. `package.json` tells me the stack." Then review what they paste, and say what you couldn't see.
- **Use values directly.** The token and component files in `assets/` are not available. `references/starter-css.md` (in the chat package) contains the token and component CSS to paste into your answer.
- **Deliver runnable code.** Default to **one complete file** (HTML, CSS and a little JavaScript) the user can save as `index.html` and open. For a framework, give each file under its path as a heading, then three lines on how to run it.
- **Never truncate silently.** If the answer is too long for one message, say so, split it into labelled parts in order, and continue when the user asks.
- **Keep the chat scannable.** Short summary first, code in code blocks, a short list of assumptions after.

## Ask before generating: the rules for every mode

Never generate a UI, restyle one or change existing code on a vague request. One message, a few options each, a recommended default, then wait.

| The user sends | You ask |
|---|---|
| A screenshot or mockup | What to do with it, the look and feel (only if changing the design), and the output technology. See `screenshot-to-code.md`. |
| Code to review or improve | What they want: a report only, a fix for one category, or full polish. Then show numbered changes and ask which to apply. See `audit-existing-code.md`. |
| "Build me a …" with no style given | Look and feel, brand color, main device, and output technology when unknown. See `direction.md`. |
| A request that names everything (style, stack, goal) | Nothing. Build it, and state your assumptions. |

Limits: at most **three** questions in Project mode (the stack comes from the code) and at most **four** in Chat mode (there is no code to read). Every question has two to four options, a recommended default, and "Not sure, you choose". Use your interactive question tool if you have one (for example `AskUserQuestion`); otherwise send a numbered list and **stop until the user replies**.

## Output technology

Project mode: read it from the project and state it. Ask only when a monorepo has several apps, or the request implies a different stack ("convert this to Vue").

Chat mode and screenshots: ask, unless the user already said. Offer, in this order:

1. **HTML + CSS, single file** *(recommended: runs anywhere, no setup)*
2. HTML + Tailwind CSS
3. React (with Tailwind or CSS)
4. Vue, Svelte or Angular
5. Something else (Next.js, Astro, Bootstrap, a template language…)

If the user answers "you choose", use option 1 and say so. How to translate the design into each technology is in `frameworks.md`.

## Where each platform loads the skill

Checked against each vendor's documentation at the time of writing. Platforms change quickly; confirm before relying on a row.

| Platform | How the skill gets there | Package |
|---|---|---|
| Claude Code | Plugin from this repo's marketplace, or copy the skill to `.claude/skills/` | Full plugin |
| OpenAI Codex | Plugin from this repo's marketplace, or copy the skill to `.agents/skills/` | Full plugin |
| Gemini CLI | Copy the skill to `.gemini/skills/` (or the `.agents/skills/` alias), or `gemini skills install <url>` | Full skill |
| ChatGPT (web, desktop, mobile) | Skills and plugins work in Chat and Work; upload the skill under Plugins and pick it with `@` | Chat package |
| Claude.ai and Claude Desktop | Upload the zip as a custom skill in Settings > Capabilities (descriptions are limited to 200 characters there) | Chat package |
| Gemini app (web) | Reported to accept skill uploads but to reject packages that contain scripts (unverified) | Chat package, or paste the instructions into a Gem |
| Custom GPT, Gem, Claude Project, any chat with an instructions field | Paste `assets/chat/paste-instructions.md` | Paste file |
| Cursor, Windsurf, Copilot | Rules or `AGENTS.md`: use the `SKILL.md` body, or the paste file | Paste file |

The **chat package** is the same guidance with a short description, no scripts and no project-folder assets. Build it with `scripts/build-chat-package.sh`.

## When a capability is missing

| Missing | Do this |
|---|---|
| No file access | Ask the user to paste the code. Say what you couldn't see. |
| No shell | Skip the scripts. Apply the rules from the references by hand, and say you did not run the contrast check. |
| No browser to render | Say you could not visually check, and list what to check at 360, 768 and 1280px. |
| No interactive question tool | Send a numbered list and stop. |
| Image attached but you can't see it | Say so. Ask for a description or the code. Never invent what the image contains. |
