import os
import sys
import json
import subprocess
from http.server import HTTPServer, BaseHTTPRequestHandler

CONFIG_FILE = "/actions-runner/data/config.json"
LOG_FILE = "/actions-runner/runner.log"

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if data:
                return data
    return {
        "target_url": os.getenv("TARGET_URL", os.getenv("REPO_URL", "")),
        "access_token": os.getenv("ACCESS_TOKEN", os.getenv("GITHUB_PAT", "")),
        "runner_name": os.getenv("RUNNER_NAME", "runner-zimaos"),
        "runner_labels": os.getenv("RUNNER_LABELS", "self-hosted,linux,x64,docker"),
        "auto_start": os.getenv("AUTO_START", "true").lower() == "true",
        "power": os.getenv("AUTO_START", "true").lower() == "true"
    }

def save_config(data):
    os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

class RunnerHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            template_path = os.path.join(os.path.dirname(__file__), 'templates', 'index.html')
            with open(template_path, 'r', encoding='utf-8') as f:
                self.wfile.write(f.read().encode('utf-8'))
        elif self.path == '/api/status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            cfg = load_config()
            status = "STOPPED"
            if os.path.exists("/tmp/runner.pid"):
                with open("/tmp/runner.pid", "r", encoding='utf-8') as f:
                    pid_str = f.read().strip()
                if pid_str.isdigit() and os.path.exists(f"/proc/{pid_str}"):
                    status = "RUNNING"
            logs = []
            if os.path.exists(LOG_FILE):
                with open(LOG_FILE, 'r', encoding='utf-8', errors='ignore') as f:
                    logs = f.readlines()[-30:]
            safe_cfg = dict(cfg)
            safe_cfg['has_token'] = bool(cfg.get('access_token'))
            safe_cfg['access_token'] = ""
            res = {
                "status": status,
                "config": safe_cfg,
                "logs": [l.strip() for l in logs]
            }
            self.wfile.write(json.dumps(res, ensure_ascii=False).encode('utf-8'))

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        body = json.loads(post_data.decode('utf-8')) if post_data else {}
        
        if self.path == '/api/config':
            cfg = load_config()
            if body.get('target_url'):
                cfg['target_url'] = body['target_url']
            if body.get('access_token'):
                cfg['access_token'] = body['access_token']
            if body.get('runner_name'):
                cfg['runner_name'] = body['runner_name']
            if body.get('runner_labels'):
                cfg['runner_labels'] = body['runner_labels']
            cfg['auto_start'] = bool(body.get('auto_start', True))
            save_config(cfg)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"message": "Configuration saved successfully!"}, ensure_ascii=False).encode('utf-8'))
        elif self.path == '/api/toggle':
            enable = body.get('enable', False)
            cfg = load_config()
            cfg['power'] = enable
            save_config(cfg)
            if enable:
                subprocess.Popen(["/bin/bash", "/actions-runner/run_runner.sh"])
                msg = "Starting runner service..."
            else:
                subprocess.Popen(["/bin/bash", "/actions-runner/stop_runner.sh"])
                msg = "Stopping runner service..."
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"message": msg}, ensure_ascii=False).encode('utf-8'))

def run_server():
    port = int(os.getenv('WEB_PORT', '8080'))
    server = HTTPServer(('0.0.0.0', port), RunnerHandler)
    print(f"Runner Web Dashboard started on port {port}")
    server.serve_forever()

if __name__ == '__main__':
    run_server()
