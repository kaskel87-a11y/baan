#!/usr/bin/env bash
# Rebuild (optional), restart the static server and the Cloudflare quick tunnel, print the public URL.
# Usage: ./serve.sh            # restart server + tunnel using the existing dist/
#        ./serve.sh --build    # npm run build first
set -euo pipefail
cd "$(dirname "$0")"
PORT="${BAAN_PORT:-4321}"
RUN=".run"
mkdir -p "$RUN"
CLOUDFLARED="${CLOUDFLARED:-$HOME/bin/cloudflared}"

if [[ "${1:-}" == "--build" || ! -f dist/index.html ]]; then
  npm run build
fi

stop() { [[ -f "$RUN/$1.pid" ]] && kill "$(cat "$RUN/$1.pid")" 2>/dev/null || true; rm -f "$RUN/$1.pid"; }
stop server
stop tunnel
# Also clear strays from earlier runs.
pkill -f "http.server $PORT" 2>/dev/null || true
pkill -f "cloudflared tunnel --url http://localhost:$PORT" 2>/dev/null || true
sleep 1

setsid nohup python3 -m http.server "$PORT" --bind 127.0.0.1 --directory dist >"$RUN/server.log" 2>&1 &
echo $! >"$RUN/server.pid"

for _ in $(seq 1 20); do curl -fsS "http://localhost:$PORT/" >/dev/null 2>&1 && break; sleep 0.5; done
curl -fsS "http://localhost:$PORT/" >/dev/null || { echo "static server failed; see $RUN/server.log"; exit 1; }

setsid nohup "$CLOUDFLARED" tunnel --no-autoupdate --protocol "${BAAN_TUNNEL_PROTOCOL:-http2}" --url "http://localhost:$PORT" >"$RUN/tunnel.log" 2>&1 &
echo $! >"$RUN/tunnel.pid"

URL=""
for _ in $(seq 1 60); do
  URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$RUN/tunnel.log" | head -1 || true)"
  [[ -n "$URL" ]] && break
  sleep 1
done
[[ -n "$URL" ]] || { echo "tunnel did not report a URL; see $RUN/tunnel.log"; exit 1; }
echo "$URL" >"$RUN/url.txt"

# The URL is assigned before the tunnel connects; wait for a registered edge connection.
for _ in $(seq 1 45); do grep -q "Registered tunnel connection" "$RUN/tunnel.log" && break; sleep 1; done
if ! grep -q "Registered tunnel connection" "$RUN/tunnel.log"; then
  echo "local:  http://localhost:$PORT/"
  echo "TUNNEL NOT CONNECTED: cloudflared got $URL but could not reach the Cloudflare edge."
  grep -E "ERR|ERROR" "$RUN/tunnel.log" | tail -3
  echo "(Quick tunnels need outbound TCP or UDP to port 7844. See $RUN/tunnel.log.)"
  exit 2
fi
# DNS for a new quick tunnel can take a few seconds.
for _ in $(seq 1 30); do curl -fsS -o /dev/null "$URL/" 2>/dev/null && break; sleep 2; done

echo "local:  http://localhost:$PORT/"
echo "public: $URL/"
