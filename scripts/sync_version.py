import os, sys, re, json
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Synchronizes semantic version string across all project manifests and docs
def sync_files(target_version, repo_root):
    ver = target_version.lstrip('v').strip()
    tag = f"v{ver}"
    updated = []

    # 1. backend/package.json
    pkg_back = repo_root / 'backend' / 'package.json'
    if pkg_back.exists():
        data = json.loads(pkg_back.read_text(encoding='utf-8'))
        if data.get('version') != ver:
            data['version'] = ver
            pkg_back.write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8')
            updated.append('backend/package.json')

    # 2. frontend/package.json
    pkg_front = repo_root / 'frontend' / 'package.json'
    if pkg_front.exists():
        data = json.loads(pkg_front.read_text(encoding='utf-8'))
        if data.get('version') != ver:
            data['version'] = ver
            pkg_front.write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8')
            updated.append('frontend/package.json')

    # 3. backend/src/services/versionService.js
    svc_file = repo_root / 'backend' / 'src' / 'services' / 'versionService.js'
    if svc_file.exists():
        content = svc_file.read_text(encoding='utf-8')
        new_content = re.sub(r"const CURRENT_VERSION = 'v?[^']+';", f"const CURRENT_VERSION = '{tag}';", content)
        if new_content != content:
            svc_file.write_text(new_content, encoding='utf-8')
            updated.append('backend/src/services/versionService.js')

    # 4. docker-compose.yml
    compose_file = repo_root / 'docker-compose.yml'
    if compose_file.exists():
        content = compose_file.read_text(encoding='utf-8')
        new_content = re.sub(r"(version:\s*)['\"]?[0-9a-zA-Z\.\-]+['\"]?", rf"\g<1>{ver}", content)
        if new_content != content:
            compose_file.write_text(new_content, encoding='utf-8')
            updated.append('docker-compose.yml')

    # 5. README.md
    readme_file = repo_root / 'README.md'
    if readme_file.exists():
        content = readme_file.read_text(encoding='utf-8')
        new_content = re.sub(r"(# 🚀 GitHub Runner Manager v)[0-9a-zA-Z\.\-]+", rf"\g<1>{ver}", content)
        if new_content != content:
            readme_file.write_text(new_content, encoding='utf-8')
            updated.append('README.md')

    return ver, updated

# Main entry point to parse version argument and invoke sync
def main():
    repo_root = Path(__file__).parent.parent.resolve()
    target_ver = sys.argv[1].strip() if len(sys.argv) > 1 and sys.argv[1].strip() else ''
    if not target_ver:
        pkg_back = repo_root / 'backend' / 'package.json'
        if pkg_back.exists():
            try: target_ver = json.loads(pkg_back.read_text(encoding='utf-8')).get('version', '')
            except Exception: pass
    if not target_ver:
        print("Error: Could not determine target version.")
        sys.exit(1)

    ver, updated = sync_files(target_ver, repo_root)
    if updated:
        print(f"Synced version {ver} to {len(updated)} file(s): {', '.join(updated)}")
    else:
        print(f"All files already synchronized at version {ver}.")

if __name__ == '__main__':
    main()
