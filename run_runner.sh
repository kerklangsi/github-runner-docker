#!/usr/bin/env bash

# Stop any existing runner process first
if [ -f /tmp/runner.pid ]; then
  PID=$(cat /tmp/runner.pid)
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    echo "Runner already running with PID $PID"
    exit 0
  fi
  rm -f /tmp/runner.pid
fi

# Load config from json or fallback to env
CONFIG_FILE="/actions-runner/data/config.json"

if [ -f "$CONFIG_FILE" ]; then
  TARGET_URL=$(jq -r '.target_url // empty' "$CONFIG_FILE")
  ACCESS_TOKEN=$(jq -r '.access_token // empty' "$CONFIG_FILE")
  RUNNER_NAME=$(jq -r '.runner_name // empty' "$CONFIG_FILE")
  RUNNER_LABELS=$(jq -r '.runner_labels // empty' "$CONFIG_FILE")
fi

TARGET_URL="${TARGET_URL:-${REPO_URL}}"
ACCESS_TOKEN="${ACCESS_TOKEN:-${GITHUB_PAT:-$PAT}}"
RUNNER_NAME="${RUNNER_NAME:-runner-$(hostname)}"
RUNNER_LABELS="${RUNNER_LABELS:-self-hosted,linux,x64,docker}"

if [ -z "${TARGET_URL}" ] || [ "${TARGET_URL}" = "https://github.com/kerklangsi/your-repo" ]; then
  echo "Notice: Target GitHub URL is not configured yet. Open Web UI at http://<host>:8080 to configure your Repository URL and PAT token." >> /actions-runner/runner.log
  echo "Notice: Target GitHub URL is not configured yet. Open Web UI at http://<host>:8080 to configure your Repository URL and PAT token."
  exit 0
fi

if [ -z "${RUNNER_TOKEN}" ] && [ -z "${ACCESS_TOKEN}" ]; then
  echo "Notice: Neither RUNNER_TOKEN nor ACCESS_TOKEN is configured. Open Web UI at http://<host>:8080 to enter your PAT token." >> /actions-runner/runner.log
  echo "Notice: Neither RUNNER_TOKEN nor ACCESS_TOKEN is configured. Open Web UI at http://<host>:8080 to enter your PAT token."
  exit 0
fi

if [ -z "${RUNNER_TOKEN}" ] && [ -n "${ACCESS_TOKEN}" ]; then
  echo "Fetching registration token from GitHub API..." >> /actions-runner/runner.log
  TARGET_URL_CLEAN="${TARGET_URL%/}"
  if [[ "${TARGET_URL_CLEAN}" =~ https://github.com/orgs/([^/]+) ]]; then
    ORG_NAME="${BASH_REMATCH[1]}"
    API_URL="https://api.github.com/orgs/${ORG_NAME}/actions/runners/registration-token"
  elif [[ "${TARGET_URL_CLEAN}" =~ https://github.com/([^/]+)/([^/]+) ]]; then
    OWNER_NAME="${BASH_REMATCH[1]}"
    REPO_NAME="${BASH_REMATCH[2]}"
    API_URL="https://api.github.com/repos/${OWNER_NAME}/${REPO_NAME}/actions/runners/registration-token"
  fi
  if [ -n "${API_URL}" ]; then
    TOKEN_RESPONSE=$(curl -s -X POST -H "Authorization: token ${ACCESS_TOKEN}" -H "Accept: application/vnd.github+json" "${API_URL}")
    RUNNER_TOKEN=$(echo "${TOKEN_RESPONSE}" | jq -r '.token // empty')
  fi
fi

if [ -z "${RUNNER_TOKEN}" ]; then
  echo "Error: Unable to fetch registration token. Check your TARGET_URL and Personal Access Token in Web UI." >> /actions-runner/runner.log
  echo "Error: Unable to fetch registration token. Check your TARGET_URL and Personal Access Token in Web UI."
  exit 0
fi


cd /actions-runner

# Deregister previous instance if present
if [ -f .runner ]; then
  ./config.sh remove --token "${RUNNER_TOKEN}" || true
  rm -f .runner .credentials .credentials_rsaparams
fi

./config.sh --url "${TARGET_URL}" --token "${RUNNER_TOKEN}" --name "${RUNNER_NAME}" --labels "${RUNNER_LABELS}" --unattended --replace >> /actions-runner/runner.log 2>&1

./run.sh >> /actions-runner/runner.log 2>&1 &
echo $! > /tmp/runner.pid
echo "Runner started with PID $(cat /tmp/runner.pid)" >> /actions-runner/runner.log
