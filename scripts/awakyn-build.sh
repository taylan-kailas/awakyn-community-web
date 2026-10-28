#!/usr/bin/env bash
# Builds the web app to be served under /community-app/ (Vercel output: out/).
# Needs AWAKYN_API_ORIGIN, e.g. https://awakyn-community.tailf659bc.ts.net
set -euo pipefail

APP_PATH="community-app"
ORIGIN="${AWAKYN_API_ORIGIN:?Set AWAKYN_API_ORIGIN to the Stoat server address}"
ORIGIN="${ORIGIN%/}"
PNPM="${PNPM:-npx -y pnpm@11.3.0}"

cd "$(dirname "$0")/.."
$PNPM install --frozen-lockfile
$PNPM --filter stoat.js build
$PNPM --filter solid-livekit-components build
$PNPM --filter client exec node scripts/copyAssets.mjs
$PNPM --filter client exec panda codegen
$PNPM --filter client exec lingui extract
$PNPM --filter client exec lingui compile --typescript

export VITE_HOST="${ORIGIN#*://}"
export VITE_API_URL="$ORIGIN/api"
export VITE_DEV_WS_URL="${ORIGIN/#https:/wss:}/ws"
export VITE_DEV_MEDIA_URL="$ORIGIN/autumn"
export VITE_DEV_PROXY_URL="$ORIGIN/january"
export VITE_DEV_GIFBOX_URL="$ORIGIN/gifbox"
export BASE_PATH="/$APP_PATH/"
$PNPM --filter client exec vite build

rm -rf out
mkdir -p out
cp -r packages/client/dist "out/$APP_PATH"
# Vercel serves real files first; every other path under the app opens the app.
cat > out/vercel.json <<JSON
{ "rewrites": [{ "source": "/$APP_PATH/:path*", "destination": "/$APP_PATH/index.html" }] }
JSON
echo "Built into out/$APP_PATH for $ORIGIN"
