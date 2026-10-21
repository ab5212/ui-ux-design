#!/usr/bin/env bash
# build-chat-package.sh: build the markdown-only "chat edition" zip for apps that take skill uploads
# (ChatGPT, Claude.ai, Gemini app). No scripts, no project assets, short description.
#
# Usage:  bash build-chat-package.sh [output-dir]      # default ./dist  → designing-interfaces-chat.zip
# Needs:  zip
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$(mkdir -p "${1:-./dist}" && cd "${1:-./dist}" && pwd)"
NAME="designing-interfaces-chat"
command -v zip >/dev/null || { echo "zip is required (apt install zip / brew install zip)." >&2; exit 1; }

STAGE="$(mktemp -d)"; trap 'rm -rf "$STAGE"' EXIT
cp "$SKILL_DIR/assets/chat/SKILL.chat.md" "$STAGE/SKILL.md"
mkdir "$STAGE/references"
cp "$SKILL_DIR"/references/*.md "$STAGE/references/"

# Chat can't copy files, so ship the token and component CSS as text the model can paste.
{
  echo "# Starter CSS"
  echo
  echo "Paste these into an answer when you build in plain HTML and CSS. They are the same files a coding agent would copy."
  echo "Put \`tokens\` first, then \`components\`, then page-specific rules. Toggle dark mode with \`class=\"dark\"\` on \`<html>\`."
  echo
  echo "## tokens (light and dark)"; echo; echo '```css'; cat "$SKILL_DIR/assets/tokens.plain.css"; echo '```'
  echo
  echo "## components (buttons, forms, cards, badges, alerts, table, navbar, dialog)"; echo; echo '```css'; cat "$SKILL_DIR/assets/plain/components.css"; echo '```'
  echo
  echo "## Style presets"; echo
  echo "Append one after the tokens to change the look. Each redefines every color for light and dark."; echo
  for f in "$SKILL_DIR"/assets/styles/*.css; do
    echo "### $(basename "$f" .css)"; echo; echo '```css'; cat "$f"; echo '```'; echo
  done
} > "$STAGE/references/starter-css.md"

# Checks: Claude.ai limits descriptions to 200 characters; some apps reject packages with scripts.
DESC="$(sed -n 's/^description: //p' "$STAGE/SKILL.md" | head -1)"
if (( ${#DESC} > 200 )); then echo "Description is ${#DESC} characters; Claude.ai allows 200." >&2; exit 1; fi
if find "$STAGE" -type f \( -name '*.sh' -o -name '*.mjs' -o -name '*.py' -o -name '*.ps1' -o -name '*.js' \) | grep -q .; then
  echo "Package contains scripts; chat apps may reject it." >&2; exit 1
fi

rm -f "$OUT/$NAME.zip"
( cd "$STAGE" && zip -qr "$OUT/$NAME.zip" . )   # SKILL.md sits at the zip root
echo "Built $OUT/$NAME.zip  (description: ${#DESC} chars, $(find "$STAGE" -type f | wc -l | tr -d ' ') files)"
