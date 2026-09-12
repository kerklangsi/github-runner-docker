#!/usr/bin/env bash
set -e

mkdir -p /opt/github-runners /app/data

DATA_FILE="/app/data/runners.json"
if [ ! -f "$DATA_FILE" ]; then
  echo '[]' > "$DATA_FILE"
fi

TARGET_URL="${REPOSITORY_URL:-${REPO_URL:-${TARGET_URL:-${ORGANIZATION_URL:-${ORG_URL}}}}}"
PAT_TOKEN="${ACCESS_TOKEN:-${GITHUB_PAT:-${PAT:-${RUNNER_TOKEN}}}}"

if [ -n "$TARGET_URL" ] && [ -n "$PAT_TOKEN" ]; then
  RUNNER_COUNT=$(jq 'length' "$DATA_FILE")
  if [ "$RUNNER_COUNT" -eq 0 ]; then
    echo "Initial runner environment variables detected. Registering Runner 1..."
    
    RUNNER_NAME_VAL="${RUNNER_NAME:-runner-1}"
    RUNNER_LABELS_VAL="${RUNNER_LABELS:-${LABELS:-self-hosted,linux,x64}}"
    RUNNER_GROUP_VAL="${RUNNER_GROUP:-${GROUP:-Default}}"
    
    RUNNER_DIR="/opt/github-runners/runner-1"
    mkdir -p "$RUNNER_DIR"
    cp -a /actions-runner/. "$RUNNER_DIR/"
    
    cd "$RUNNER_DIR"
    if [[ "$PAT_TOKEN" =~ ^ghp_ || "$PAT_TOKEN" =~ ^github_pat_ ]]; then
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
        REG_TOKEN=$(curl -s -X POST -H "Authorization: token ${PAT_TOKEN}" -H "Accept: application/vnd.github+json" "${API_URL}" | jq -r '.token // empty')
      fi
    else
      REG_TOKEN="$PAT_TOKEN"
    fi

    if [ -n "$REG_TOKEN" ]; then
      ./config.sh --url "$TARGET_URL" --token "$REG_TOKEN" --name "$RUNNER_NAME_VAL" --labels "$RUNNER_LABELS_VAL" --runnergroup "$RUNNER_GROUP_VAL" --unattended --replace || true
      
      NEW_RUNNER_JSON=$(jq -n \
        --arg id "runner-1" \
        --arg name "$RUNNER_NAME_VAL" \
        --arg target_url "$TARGET_URL" \
        --arg access_token "$PAT_TOKEN" \
        --arg labels "$RUNNER_LABELS_VAL" \
        --arg group "$RUNNER_GROUP_VAL" \
        --arg dir "$RUNNER_DIR" \
        --arg status "idle" \
        --arg auto_start "true" \
        '{id: $id, name: $name, target_url: $target_url, access_token: $access_token, labels: $labels, runner_group: $group, runner_dir: $dir, status: $status, auto_start: ($auto_start == "true"), created_at: (now | todate)}')
      
      jq ". += [$NEW_RUNNER_JSON]" "$DATA_FILE" > "${DATA_FILE}.tmp" && mv "${DATA_FILE}.tmp" "$DATA_FILE"
      echo "Runner 1 registered successfully."
    else
      echo "Failed to retrieve registration token from GitHub API for initial runner."
    fi
  fi
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



