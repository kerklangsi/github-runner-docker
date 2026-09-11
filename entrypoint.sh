#!/usr/bin/env bash
set -e

# Support both TARGET_URL and REPO_URL
TARGET_URL="${TARGET_URL:-$REPO_URL}"

# Support ACCESS_TOKEN, GITHUB_PAT, or PAT
ACCESS_TOKEN="${ACCESS_TOKEN:-${GITHUB_PAT:-$PAT}}"

# Runner parameters with defaults
RUNNER_NAME="${RUNNER_NAME:-runner-$(hostname)}"
RUNNER_LABELS="${RUNNER_LABELS:-self-hosted,linux,x64,docker}"
RUNNER_GROUP="${RUNNER_GROUP:-Default}"
RUNNER_WORKDIR="${RUNNER_WORKDIR:-_work}"
EPHEMERAL="${EPHEMERAL:-false}"
DISABLE_AUTO_UPDATE="${DISABLE_AUTO_UPDATE:-false}"

# Validate required configuration
if [ -z "${TARGET_URL}" ]; then
  echo "Error: TARGET_URL (or REPO_URL) environment variable is required."
  echo "Example: TARGET_URL=https://github.com/owner/repo"
  exit 1
fi

# Fetch registration token using Personal Access Token (PAT) if RUNNER_TOKEN is not provided
if [ -z "${RUNNER_TOKEN}" ]; then
  if [ -n "${ACCESS_TOKEN}" ]; then
    echo "Fetching runner registration token using provided ACCESS_TOKEN..."
    
    # Strip trailing slash if present
    TARGET_URL_CLEAN="${TARGET_URL%/}"
    
    # Determine if URL is for an organization or repository
    if [[ "${TARGET_URL_CLEAN}" =~ https://github.com/orgs/([^/]+) ]]; then
      ORG_NAME="${BASH_REMATCH[1]}"
      API_URL="https://api.github.com/orgs/${ORG_NAME}/actions/runners/registration-token"
    elif [[ "${TARGET_URL_CLEAN}" =~ https://github.com/([^/]+)/([^/]+) ]]; then
      OWNER_NAME="${BASH_REMATCH[1]}"
      REPO_NAME="${BASH_REMATCH[2]}"
      API_URL="https://api.github.com/repos/${OWNER_NAME}/${REPO_NAME}/actions/runners/registration-token"
    else
      echo "Error: Invalid TARGET_URL format: ${TARGET_URL}"
      exit 1
    fi
    
    TOKEN_RESPONSE=$(curl -s -X POST -H "Authorization: token ${ACCESS_TOKEN}" -H "Accept: application/vnd.github+json" "${API_URL}")
    RUNNER_TOKEN=$(echo "${TOKEN_RESPONSE}" | jq -r '.token // empty')
    
    if [ -z "${RUNNER_TOKEN}" ]; then
      echo "Error: Failed to obtain runner registration token from GitHub API."
      echo "API Response: ${TOKEN_RESPONSE}"
      exit 1
    fi
  else
    echo "Error: Either RUNNER_TOKEN or ACCESS_TOKEN environment variable must be specified."
    exit 1
  fi
fi

# Build config argument array
CONFIG_ARGS=(
  --url "${TARGET_URL}"
  --token "${RUNNER_TOKEN}"
  --name "${RUNNER_NAME}"
  --labels "${RUNNER_LABELS}"
  --work "${RUNNER_WORKDIR}"
  --unattended
  --replace
)

if [ "${RUNNER_GROUP}" != "Default" ] && [ -n "${RUNNER_GROUP}" ]; then
  CONFIG_ARGS+=(--runnergroup "${RUNNER_GROUP}")
fi

if [ "${EPHEMERAL}" = "true" ]; then
  CONFIG_ARGS+=(--ephemeral)
fi

if [ "${DISABLE_AUTO_UPDATE}" = "true" ]; then
  CONFIG_ARGS+=(--disableupdate)
fi

# Clean deregistration function on container stop
deregister_runner() {
  echo "Stopping runner..."
  if [ -n "${RUNNER_TOKEN}" ]; then
    ./config.sh remove --token "${RUNNER_TOKEN}" || true
  fi
  rm -f .runner .credentials .credentials_rsaparams || true
}

trap 'deregister_runner' SIGINT SIGQUIT SIGTERM

echo "Configuring GitHub Actions Runner..."
sudo mkdir -p /actions-runner/_work
sudo chown -R runner:runner /actions-runner/_work

# Clean stale configuration files if container crashed or stopped abruptly
if [ -f .runner ]; then
  echo "Stale runner configuration detected from previous run. Cleaning state..."
  rm -f .runner .credentials .credentials_rsaparams || true
fi

./config.sh "${CONFIG_ARGS[@]}"

echo "Starting GitHub Actions Runner..."
./run.sh &
RUN_PID=$!

wait "${RUN_PID}"
