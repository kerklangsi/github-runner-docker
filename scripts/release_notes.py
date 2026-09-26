import os, sys, json
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Constructs rich markdown release notes for GitHub Runner Manager
def build_notes(tag, desc=""):
    version = tag.lstrip('v')
    notes = [
        f"# 🚀 GitHub Runner Manager — `{tag}`",
        "",
        f"> **Version {version}** • Full-stack Web GUI & container supervisor for GitHub Actions self-hosted runners.",
        "",
        "---",
        "",
        "### 🌟 Release Highlights",
        "- **Web Dashboard**: Real-time process monitoring, live log streaming, CPU/memory telemetry, and runner status.",
        "- **Process Supervisor**: Detached runner process lifecycle management with signal escalation termination.",
        "- **Persistent Storage**: Dedicated repository shared data (`/opt/shared_data`) and persistent cache volume (`/home/runner/.cache`).",
        "- **Docker-in-Docker**: Full container execution support with rootless/sudo access and socket binding.",
        "- **Multi-Architecture**: Native support for both `linux/amd64` and `linux/arm64` container hosts.",
        "",
        "---",
        "",
        "### 🐳 Docker Hub Images",
        "| Tag | Architecture | Registry URI |",
        "| :--- | :--- | :--- |",
        "| `latest` | `amd64, arm64` | `docker.io/kerklangsi/github-runner-docker:latest` |",
        f"| `{tag}` | `amd64, arm64` | `docker.io/kerklangsi/github-runner-docker:{tag}` |",
        f"| `{version}` | `amd64, arm64` | `docker.io/kerklangsi/github-runner-docker:{version}` |",
        "",
        "---",
        "",
        "### ⚡ Quick Start",
        "```bash",
        "docker run -d \\",
        "  --name github-runner-manager \\",
        "  --restart unless-stopped \\",
        "  -p 3000:3000 \\",
        "  -v /var/run/docker.sock:/var/run/docker.sock \\",
        "  -v /DATA/AppData/github-runner/data:/app/data \\",
        "  -v /DATA/AppData/github-runner/runners:/opt/github-runners \\",
        "  -v /DATA/AppData/github-runner/shared_data:/opt/shared_data \\",
        "  -v /DATA/AppData/github-runner/cache:/home/runner/.cache \\",
        f"  kerklangsi/github-runner-docker:{tag}",
        "```",
        "",
        "---",
        "",
        "### 📦 Port & Volume Reference",
        "- **Port `3000`**: Web GUI and REST API",
        "- **Volume `/var/run/docker.sock`**: Docker engine host access for running container workflows",
        "- **Volume `/app/data`**: SQLite/JSON database and system settings",
        "- **Volume `/opt/github-runners`**: GitHub Actions runner binaries and temporary workspace",
        "- **Volume `/opt/shared_data`**: Persistent repository authentication credentials and session tokens",
        "- **Volume `/home/runner/.cache`**: Toolchains cache (`/opt/hostedtoolcache`) and dependency packages"
    ]
    if desc and desc.strip():
        notes.insert(6, f"### 📝 Release Summary\n{desc.strip()}\n\n---")
    return '\n'.join(notes)

# Program entry point for generating release notes
def main():
    repo_root = Path(__file__).parent.parent.resolve()
    tag, out_file, desc, idx = None, None, '', 1
    while idx < len(sys.argv):
        if sys.argv[idx] == '--tag' and idx + 1 < len(sys.argv):
            tag, idx = sys.argv[idx + 1], idx + 2
        elif sys.argv[idx] == '--out' and idx + 1 < len(sys.argv):
            out_file, idx = sys.argv[idx + 1], idx + 2
        elif sys.argv[idx] == '--desc' and idx + 1 < len(sys.argv):
            desc, idx = sys.argv[idx + 1], idx + 2
        else:
            idx += 1
    if not tag:
        pkg_file = repo_root / 'backend' / 'package.json'
        if pkg_file.exists():
            try: tag = f"v{json.loads(pkg_file.read_text(encoding='utf-8')).get('version', '3.2.0')}"
            except Exception: pass
    tag = tag or 'v3.2.0'
    notes = build_notes(tag, desc)
    if out_file:
        out_path = Path(out_file) if Path(out_file).is_absolute() else (repo_root / out_file)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(notes, encoding='utf-8')
        print(f"Generated release notes at {out_path}")
    else:
        print(notes)

if __name__ == '__main__':
    main()
