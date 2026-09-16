---
name: github-runner-docker-test-sequence
description: >-
  Executes a comprehensive, step-by-step verification test sequence for the
  GitHub Runner Manager Docker application. Covers clean environment reset,
  container build verification, dynamic telemetry graph checks, runner creation,
  start/stop/log/delete controls, persistent log tracking, theme switcher,
  avatar upload, workflow logs, token locking, config import, and full report generation.
---

# GitHub Runner Manager Docker - Test Sequence Workflow

## Overview
This skill provides a standardized, automated test protocol for verifying the **GitHub Runner Manager Docker** web platform. It ensures all UI layouts, backend APIs, Docker container lifecycles, and directory cleanup mechanisms function flawlessly without regression.

> [!IMPORTANT] **Security & Execution Order Rules**:
> 1. **No Private Data in Docker**: The Docker image and application source code do **NOT** contain hardcoded private GitHub URLs or tokens. Test parameters are fetched directly from this skill document (`SKILL.md`) at test execution time.
> 2. **Report ONLY After Thorough Verification**: Always run full compilation (`npm run build`), backend syntax checks (`node --check`), and complete browser test execution **BEFORE** generating or publishing the test report. Never report success prior to actual execution.
> 3. **Proper Input Field Selection & Clearing**: When entering text, tokens, or URLs into form fields during testing or automation, **always select all existing text (`Ctrl+A`) or clear the field properly before inserting new text**. Do not append text directly onto pre-filled default inputs to avoid creating duplicated concatenated values (e.g., double tokens or double URLs).

## Credentials & Workflow Search Keys (Skill-Managed)
- **Primary Registration Token**: `BNX7UBVUPMA652N2I6JCXXTKU2EP4`
- **Target Repository URL**: `https://github.com/kerklangsi/MY-tv`
- **Target Workflow Actions**: `https://github.com/kerklangsi/MY-tv/actions/workflows/update_iptv.yml`

## Test Sequence Protocol

### Step 1: Environment Reset & Container Startup
1. Reset the environment by removing existing containers and volume storage:
   ```bash
   docker compose down -v && docker compose up -d --build
   ```
   - **Reset with `-v`**: Ensures untracked directories, stale state, and volume caches are cleared.
   - **Zero Polling Rule**: Do **NOT** set short recurring timers (e.g., 10s, 15s) or poll `task status` in a loop. Rely strictly on the background task completion notification to resume execution.
2. Verify container execution status:
   ```bash
   docker ps
   ```
   Ensure `github-runner` container is active on `0.0.0.0:8080->3000/tcp`.

### Step 2: Full Compilation & Syntax Verification
1. Execute frontend production build inside container:
   ```bash
   docker exec github-runner sh -c "cd /app/frontend && npm run build"
   ```
   Verify 0 compilation/type errors and transformation of all modules.
2. Run backend syntax check on core service files:
   ```bash
   docker exec github-runner node --check /app/backend/src/server.js
   docker exec github-runner node --check /app/backend/src/services/runnerService.js
   docker exec github-runner node --check /app/backend/src/services/logService.js
   docker exec github-runner node --check /app/backend/src/services/systemService.js
   ```
   Ensure all commands exit with code `0`.

### Step 3: Dashboard View Verification (`http://localhost:8080`)
1. Open `http://localhost:8080` in the browser.
2. Confirm the **Dashboard** view layout:
   - Sidebar is present with navigation items (Dashboard, All Runners, Global Logs, System Hardware, Settings).
   - System resource cards (CPU Usage, Memory, Disk Storage) display live percentages.
   - **Container Uptime Card**: Displays uptime calculated from container start (`process.uptime()`), NOT PC or host OS uptime.
   - **Runner Status Breakdown** shows counts for `ONLINE`, `IDLE`, `BUSY`, `OFFLINE`, and `CRASHED`.
3. **Strict UI Boundary**: Verify that **NO** `+ Add Runner Container` card exists on the Dashboard view.

### Step 4: All Runners Provisioning, Config Upload & Token Lock Test
1. Click **All Runners** in the sidebar.
2. Click the `+ Add Runner Container` button.
3. Test **Upload from Config**:
   - Upload a `.json` or `.env` configuration file using the file picker.
   - Verify fields (Runner Name, GitHub URL, Token, Labels, Group) auto-fill.
4. Test **Registration Token Eye Toggle & Field Locking**:
   - In Add Runner modal: Select all existing text (`Ctrl+A`) before typing token. Toggle Eye icon to show/hide registration token.
   - Provide token: `BNX7UBRETJ4PEHWKA3ZADOTKUZYTE` (if failed, fallback to `BNX7UBXQ57GZ4ZIH5BPHKCDKUZRQ6`).
5. Provision runner -> verify runner card created.
6. In Runner Card inline editor:
   - Verify Registration Token input is **locked (disabled)** by default.
   - Click **Change Token** button -> input unlocks for editing.
   - Click Eye icon -> toggle token visibility.

### Step 5: Log Streaming, Save Log & Workflow Integration
1. Click **Global Logs** in sidebar:
   - Verify live stream contains Docker container logs (`docker.log`), backend server stdout, and GitHub Actions workflow status for `update_iptv.yml`.
   - Verify **Copy Log** and **Save Log** (`.log` file download) buttons are located at the **bottom-right** of the container.
2. Open Live Logs modal for runner:
   - Confirm **Save Log** replaces Print Log.
   - Confirm **Copy Log** and **Save Log** buttons are located at the **bottom-right** of the modal.

### Step 6: Settings Tab 3-Container Split
1. Navigate to **Settings** view.
2. Confirm user profile & security is split into 3 distinct container cards:
   - **Administrator Account Container**: Username identity and active session badge.
   - **Avatar / Profile Picture Container**: Docker volume storage upload (`/app/data/avatar.png`) and image URL link option.
   - **Password Security Container**: Current, New, and Confirm Password fields.

### Step 7: Floating Theme Switcher Verification
1. Click floating palette icon in the **bottom-right corner**.
2. Switch between **Dark Mode**, **Light Mode**, and **Cyberpunk Mode**.
3. Confirm instant CSS variable overrides (`themes/theme.css`) across all panels and texts.

### Step 8: Full Test Report Generation (AFTER Thorough Testing ONLY)
Only **AFTER** completing Steps 1 through 7 and collecting live compilation logs and screenshot evidence, compile and generate the final markdown report documenting:
- Summary table of all test steps and empirical pass/fail statuses.
- Exact build compilation outputs (`vite build`) and syntax check exit codes.
- Screenshots and UI verification proofs.
- Final conclusions and system health rating.

## Common Pitfalls & Anti-Patterns
- **NO PREMATURE REPORTING**: Never write or publish test reports before performing actual build compilation and browser verification.
- **NO PRIVATE DATA IN DOCKER**: Application source code and Docker containers must NOT contain hardcoded private tokens or URLs. Fetch them from skill during testing.
- **STRICT NO-POLLING RULE**: Never invoke short status timers (10s/15s) or poll background commands. Wait for the system's task completion notification.
- **Do NOT append onto pre-filled inputs**: Always select all text (`Ctrl+A`) or clear field values properly before typing to avoid double tokens or URLs.
- **Do NOT introduce browser popups**: Use custom dark modals for confirmation actions (`delete`, `provision`).
- **Do NOT restore Add Runner card to Dashboard**: Centralize runner creation strictly under the All Runners view.
