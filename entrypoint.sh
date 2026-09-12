#!/usr/bin/env bash
set -e

mkdir -p /opt/github-runners /app/data

DATA_FILE="/app/data/runners.json"
if [ ! -f "$DATA_FILE" ]; then
  echo '[]' > "$DATA_FILE"
fi

shutdown() {
  echo "Stopping GitHub Runner Manager Node Server..."
  if [ -n "$NODE_PID" ]; then
    kill "$NODE_PID" || true
  fi
  exit 0
}

trap 'shutdown' SIGTERM SIGINT

echo "Starting GitHub Runner Manager Web Dashboard & Backend on port 3000..."
node /app/backend/src/server.js &
NODE_PID=$!

wait "$NODE_PID"




