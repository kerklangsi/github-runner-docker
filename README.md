# Docker GitHub Self-Hosted Runner

A general-purpose, lightweight Docker container for running GitHub Actions self-hosted runners on any Linux server, workstation, or cloud environment.

## Features
- **Universal Target Support**: Works seamlessly for both GitHub **Repositories** (`https://github.com/owner/repo`) and **Organizations** (`https://github.com/orgs/org-name`).
- **Dual Authentication Modes**: Supports one-time registration tokens (`RUNNER_TOKEN`) or GitHub Personal Access Tokens (`ACCESS_TOKEN` / `GITHUB_PAT`) for automated dynamic token fetching.
- **Docker-in-Docker Support**: Mounts host `/var/run/docker.sock` so workflows can execute `docker build`, `docker run`, and containerized actions.
- **Ephemeral Runner Support**: Enable `EPHEMERAL=true` for automatic single-job teardown (clean CI/CD isolation).
- **Graceful Termination**: Captures container signals (`SIGTERM`, `SIGINT`) to clean up and unregister from GitHub before exit.

---

## Environment Variables

| Variable | Description | Default | Required? |
| :--- | :--- | :--- | :--- |
| `TARGET_URL` (or `REPO_URL`) | Target GitHub Repo (`https://github.com/owner/repo`) or Org (`https://github.com/orgs/org-name`) | None | **Yes** |
| `RUNNER_TOKEN` | One-time registration token from GitHub Settings | None | Yes (unless `ACCESS_TOKEN` set) |
| `ACCESS_TOKEN` (or `GITHUB_PAT`) | Personal Access Token with `repo` or `admin:org` scope to auto-fetch runner token | None | Yes (unless `RUNNER_TOKEN` set) |
| `RUNNER_NAME` | Custom name displayed on GitHub Actions dashboard | `runner-<hostname>` | No |
| `RUNNER_LABELS` | Comma-separated labels used by workflows (`runs-on: [self-hosted, docker]`) | `self-hosted,linux,x64,docker` | No |
| `RUNNER_GROUP` | Organization Runner Group | `Default` | No |
| `EPHEMERAL` | Set `true` to dismantle runner container after finishing 1 job | `false` | No |
| `DISABLE_AUTO_UPDATE` | Set `true` to disable runner binary auto-updates | `false` | No |
| `RUNNER_WORKDIR` | Working directory for actions runner inside container | `_work` | No |

---

## Quickstart

### Option 1: Docker Compose (Recommended)

1. **Clone repository & prepare configuration**:
   ```bash
   cp .env.example .env
   ```

2. **Configure `.env`**:
   Edit `.env` with your GitHub target URL and registration token:
   ```env
   TARGET_URL=https://github.com/my-org/my-repo
   RUNNER_TOKEN=BXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **Launch runner container**:
   ```bash
   docker compose up -d
   ```

4. **View runner logs**:
   ```bash
   docker compose logs -f
   ```

---

### Option 2: Docker CLI

**Build Image**:
```bash
docker build -t github-runner:latest .
```

**Run using Registration Token**:
```bash
docker run -d \
  --name my-github-runner \
  --restart unless-stopped \
  -e TARGET_URL="https://github.com/owner/repo" \
  -e RUNNER_TOKEN="BXXXXXXXXXXXXXXXXXXXXXXXX" \
  -e RUNNER_NAME="docker-runner-01" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  github-runner:latest
```

**Run using Personal Access Token (PAT)**:
```bash
docker run -d \
  --name my-github-runner \
  --restart unless-stopped \
  -e TARGET_URL="https://github.com/owner/repo" \
  -e ACCESS_TOKEN="ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" \
  -e RUNNER_NAME="pat-runner-01" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  github-runner:latest
```

---

## How to Obtain GitHub Tokens

### Option A: One-Time Registration Token (`RUNNER_TOKEN`)
1. Go to your GitHub Repository or Organization.
2. Navigate to **Settings** -> **Actions** -> **Runners**.
3. Click **New self-hosted runner**.
4. Copy the token string from the `./config.sh --token <TOKEN>` step.

### Option B: Personal Access Token (`ACCESS_TOKEN`)
1. Go to GitHub **Settings** -> **Developer Settings** -> **Personal Access Tokens** -> **Tokens (classic)**.
2. Click **Generate new token**.
3. Select required scopes:
   - For **Repository Runners**: select `repo`
   - For **Organization Runners**: select `admin:org`
4. Set the generated token as `ACCESS_TOKEN` in your environment.

---

## Example GitHub Actions Workflow

In your repository `.github/workflows/ci.yml`:

```yaml
name: Self-Hosted CI Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: [self-hosted, docker]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Verify Environment
        run: |
          echo "Running job on self-hosted Docker runner!"
          docker --version
          python3 --version
```
