# 🚀 GitHub Runner Manager v3.0.0

A modern, full-stack Web GUI and Docker container manager for GitHub Actions self-hosted runners. Easily provision, monitor, control, and update multiple GitHub runner instances from a high-performance web dashboard.

[![Docker Image](https://img.shields.io/docker/v/kerklangsi/github-runner-docker?label=Docker%20Hub&color=0969da)](https://hub.docker.com/r/kerklangsi/github-runner-docker)
[![GitHub Release](https://img.shields.io/github/v/release/kerklangsi/github-runner-docker?color=238636)](https://github.com/kerklangsi/github-runner-docker/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

- **🌐 Modern Web Dashboard**: React + Express UI for managing all runner instances in real-time.
- **⚡ Rapid Runner Provisioning**: Provision repository or organization runners using Personal Access Tokens (PAT) or one-time registration tokens.
- **🖥️ Built-in Interactive Web Terminal**: Execute diagnostics directly from the web shell.
- **📊 Real-time Hardware Telemetry**: Monitor CPU, RAM, Disk space, and network bandwidth cgroup metrics.
- **📜 Live Log Streaming**: Inspect isolated runner logs and global container buffers with real-time level filtering (INFO, DEBUG, WARN, ERROR).
- **📋 Workflow Execution Tracking**: Track recent GitHub Actions workflow runs and completion states.
- **🛡️ Watchdog & Webhooks**: Automatic crash recovery with testable Discord/Slack webhook notifications.
- **💾 Config Backup & Restore**: Export and import system configurations as JSON.
- **🎨 Dark / Light Themes & Custom Avatars**: Customize profile avatar image URLs or base64 uploads.
- **🚀 Automatic Update Checker**: Notifies users in-app when new releases are pushed to GitHub or Docker Hub.
- **🖥️ ZimaOS & CasaOS App Store Ready**: Fully supports `x-casaos` native app store manifests.

---

## ⚡ Quickstart

### Option 1: Docker Hub Image (Recommended)

Run the pre-built image directly from Docker Hub:

```bash
docker run -d \
  --name github-runner-manager \
  --restart unless-stopped \
  -p 8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v runner-data:/app/data \
  kerklangsi/github-runner-docker:latest
```

Access the Web Dashboard at **`http://localhost:8080`** (Default Login: Username `admin`, Password `admin`).

---

### Option 2: Docker Compose

```yaml
version: '3.8'

services:
  github-runner-manager:
    image: kerklangsi/github-runner-docker:latest
    container_name: github-runner-manager
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - runner-data:/app/data

volumes:
  runner-data:
```

Launch with:
```bash
docker compose up -d
```

---

### Option 3: ZimaOS / CasaOS App Store

This repository includes a native `x-casaos` manifest for **ZimaOS** and **CasaOS** App Stores.

1. Open **ZimaOS App Store** or **CasaOS App Store**.
2. Click **Manual Install** or **Custom Install** (or add your repository URL as a custom App Store source).
3. Copy and paste the contents of [`docker-compose.yml`](file:///e:/GoogleDrive/Github/github-runner-docker/docker-compose.yml) or load [`Apps/github-runner-docker/docker-compose.yml`](file:///e:/GoogleDrive/Github/github-runner-docker/Apps/github-runner-docker/docker-compose.yml).
4. Click **Install**. ZimaOS will configure ports, storage binds, icons, and launching shortcuts automatically!

---

## 🛠️ Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Web GUI and API server port | `8080` |
| `DATA_DIR` | Persistent database and settings storage | `/app/data` |
| `RUNNERS_DIR` | Working directory for provisioned runners | `/opt/github-runners` |

---

## 🔒 Security & Persistence

- All runner metadata, encrypted access tokens, system logs, and custom avatars are safely persisted inside the `/app/data` Docker volume mount.
- Password change forms in the Settings tab allow changing the default `admin` credentials immediately.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

Made with ❤️ by [Kerk Langsi](https://github.com/kerklangsi).
