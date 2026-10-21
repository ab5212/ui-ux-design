#!/usr/bin/env bash
# scaffold-playground.sh — copy the UI playground template and install dependencies.
#
# Usage:  bash scaffold-playground.sh [target-dir] [--update] [--style NAME] [--tokens path/to/tokens.css]
#   target-dir  defaults to ./ui-playground (must not exist or must be empty, unless --update)
#   --update    refresh an existing playground to this skill version. Replaces the app code, keeps your saved
#               choices (the Save-to-code block in src/styles/tokens.css) and playground-layout.json, and backs up
#               the old tokens.css as tokens.css.bak. Run it after updating the plugin.
#   --style     layer a style preset after the tokens: any file name in assets/styles (flat, material, soft, glass, clay, skeuomorphic, brutalist, editorial,
#                monochrome, colorblock, retro, minimalvintage, retrofuturistic, artdeco)
#   --tokens    replace the template tokens with the project's own token file (applied before --style)
#
# Then:   cd <target-dir> && npm run dev   →  http://localhost:5173
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE="$SKILL_DIR/assets/playground"
TARGET="./ui-playground"
TOKENS=""
STYLE=""
UPDATE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tokens) TOKENS="${2:?--tokens needs a path}"; shift 2 ;;
    --style) STYLE="${2:?--style needs a name}"; shift 2 ;;
    --update) UPDATE=1; shift ;;
    -h|--help) sed -n '2,16p' "$0"; exit 0 ;;
    *) TARGET="$1"; shift ;;
  esac
done

command -v node >/dev/null || { echo "Node.js 20.19+ or 22.12+ is required: https://nodejs.org" >&2; exit 1; }
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if (( NODE_MAJOR < 20 )); then echo "Node.js 20.19+ is required (found $(node -v))." >&2; exit 1; fi

if (( UPDATE )); then
  [[ -f "$TARGET/package.json" && -f "$TARGET/src/styles/tokens.css" ]] || { echo "'$TARGET' is not a playground (no package.json and src/styles/tokens.css). Nothing updated." >&2; exit 1; }
  OLD_TOKENS="$(mktemp)"; cp "$TARGET/src/styles/tokens.css" "$OLD_TOKENS"
elif [[ -e "$TARGET" && -n "$(ls -A "$TARGET" 2>/dev/null)" ]]; then
  echo "Target '$TARGET' exists and is not empty. Choose another directory, or add --update to refresh it." >&2; exit 1
fi

mkdir -p "$TARGET"
# Copy everything except build output and installed modules.
( cd "$TEMPLATE" && tar --exclude=node_modules --exclude=dist -cf - . ) | ( cd "$TARGET" && tar -xf - )

# Style presets for the in-page Style picker.
mkdir -p "$TARGET/src/styles/presets" && cp "$SKILL_DIR"/assets/styles/*.css "$TARGET/src/styles/presets/"

if (( UPDATE )); then
  # Keep the user's saved choices: the Save-to-code block goes back on top of the fresh tokens.
  cp "$OLD_TOKENS" "$TARGET/src/styles/tokens.css.bak"
  BLOCK="$(sed -n '/^\/\* playground:start/,/^\/\* playground:end \*\//p' "$OLD_TOKENS")"
  [[ -n "$BLOCK" ]] && { echo; echo "$BLOCK"; } >> "$TARGET/src/styles/tokens.css"
  rm -f "$OLD_TOKENS"
  echo "Updated. Old tokens kept as src/styles/tokens.css.bak; your saved Save-to-code choices were carried over."
fi

# The contrast script path inside the template points at the skill; make it absolute for the copy.
node -e '
  const fs = require("fs"); const p = process.argv[1] + "/package.json";
  const pkg = JSON.parse(fs.readFileSync(p, "utf8"));
  pkg.scripts.contrast = `node "${process.argv[2]}/scripts/check-contrast.mjs" src/styles/tokens.css`;
  fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + "\n");
' "$TARGET" "$SKILL_DIR"

if [[ -n "$TOKENS" ]]; then
  cp "$TOKENS" "$TARGET/src/styles/tokens.css"
  echo "Using tokens from $TOKENS. If its variable names differ, edit the @theme inline block."
fi

if [[ -n "$STYLE" ]]; then
  PRESET="$SKILL_DIR/assets/styles/$STYLE.css"
  if [[ ! -f "$PRESET" ]]; then
    echo "Unknown style '$STYLE'. Available: $(ls "$SKILL_DIR/assets/styles" | sed 's/\.css$//' | tr '\n' ' ')" >&2; exit 1
  fi
  # Appended after the tokens so it wins the cascade (see the header comment in the preset).
  { echo; cat "$PRESET"; } >> "$TARGET/src/styles/tokens.css"
  # A preset that needs Google Fonts names its stylesheet on a "google-fonts:" line; add it to the page.
  FONTS="$(sed -n 's/^ *google-fonts: *//p' "$PRESET" | head -1)"
  if [[ -n "$FONTS" ]]; then
    FONTS="${FONTS//&/\\&}"  # a literal & would mean "the matched text" in the sed replacement
    sed -i.bak "s#</head>#    <link rel=\"stylesheet\" href=\"$FONTS\" />\n  </head>#" "$TARGET/index.html" && rm -f "$TARGET/index.html.bak"
  fi
  echo "Applied style preset: $STYLE"
fi

cd "$TARGET"
if [[ -f package-lock.json ]]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

echo
echo "Playground ready in $TARGET"
echo "  cd $TARGET && npm run dev        # http://localhost:5173"
echo "  npm run contrast                 # audit token contrast"
echo "  npm run build && npm run preview # production check"
