#!/usr/bin/env bash
set -e

mkdir -p /actions-runner/data
sudo mkdir -p /actions-runner/_work
sudo chown -R runner:runner /actions-runner/_work /actions-runner/data

# Cleanup function on container shutdown
cleanup() {
  echo "Shutting down container services..."
  /bin/bash /actions-runner/stop_runner.sh || true
  if [ -n "$WEB_PID" ]; then
    kill "$WEB_PID" || true
  fi
}

trap 'cleanup' SIGINT SIGQUIT SIGTERM

# Start Web Management Server in background
echo "Starting GitHub Runner Web Dashboard on port 8080..."
python3 /actions-runner/web_server.py &
WEB_PID=$!

CONFIG_FILE="/actions-runner/data/config.json"
AUTO_START_VAL="${AUTO_START:-true}"

if [ -f "$CONFIG_FILE" ]; then
  AUTO_START_VAL=$(jq -r '.auto_start // true' "$CONFIG_FILE")
  POWER_VAL=$(jq -r '.power // true' "$CONFIG_FILE")
else
  POWER_VAL="true"
fi

if [ "$AUTO_START_VAL" = "true" ] && [ "$POWER_VAL" = "true" ]; then
  echo "Auto-starting runner service..."
  /bin/bash /actions-runner/run_runner.sh || true
else
  echo "Runner auto-start is OFF. Access the Web Dashboard on port 8080 to start the runner manually."
fi

# Keep container process alive via web server
wait "${WEB_PID}"

