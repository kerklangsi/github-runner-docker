#!/usr/bin/env bash
set -e

mkdir -p /opt/github-runners /app/data /home/runner/.cache /opt/github-runners/shared_data

# Unify hostedtoolcache into single cache volume so docker-compose requires only 1 volume mount
if [ ! -L /opt/hostedtoolcache ]; then
  rm -rf /opt/hostedtoolcache
  ln -sfn /home/runner/.cache /opt/hostedtoolcache
fi

sudo chown -R runner:runner /home/runner/.cache /opt/github-runners /app/data || true

DATA_FILE="/app/data/runners.json"
if [ ! -f "$DATA_FILE" ]; then
  echo '[]' > "$DATA_FILE"
fi

# Handles graceful container shutdown by terminating node backend process.
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




