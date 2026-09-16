const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || '/app/data';
const RUNNERS_FILE = path.join(DATA_DIR, 'runners.json');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const AUTH_FILE = path.join(DATA_DIR, 'auth.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(RUNNERS_FILE)) {
    fs.writeFileSync(RUNNERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(JOBS_FILE)) {
    fs.writeFileSync(JOBS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(AUTH_FILE)) {
    const defaultAuth = {
      username: "admin",
      password: "admin123",
      lastLogin: null
    };
    fs.writeFileSync(AUTH_FILE, JSON.stringify(defaultAuth, null, 2), 'utf-8');
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
      appName: "GitHub Runner Manager",
      port: 3000,
      targetUrl: process.env.TARGET_URL || process.env.REPO_URL || "",
      accessToken: process.env.ACCESS_TOKEN || process.env.GITHUB_PAT || process.env.PAT || "",
      runnerToken: process.env.RUNNER_TOKEN || "",
      runnerNamePrefix: process.env.RUNNER_NAME || "runner",
      runnerLabels: process.env.RUNNER_LABELS || "self-hosted,linux,x64",
      runnerGroup: process.env.RUNNER_GROUP || "Default",
      autoStartRunners: true,
      refreshInterval: 3,
      cpuWarningThreshold: 85,
      ramWarningThreshold: 85,
      diskWarningThreshold: 90,
      logLevel: "INFO",
      showHeadlines: false
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf-8');
  }
}

function getRunners() {
  ensureDataDir();
  const raw = fs.readFileSync(RUNNERS_FILE, 'utf-8');
  return JSON.parse(raw || '[]');
}

function saveRunners(runners) {
  ensureDataDir();
  fs.writeFileSync(RUNNERS_FILE, JSON.stringify(runners, null, 2), 'utf-8');
}

function getJobs() {
  ensureDataDir();
  const raw = fs.readFileSync(JOBS_FILE, 'utf-8');
  return JSON.parse(raw || '[]');
}

function saveJobs(jobs) {
  ensureDataDir();
  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf-8');
}

function getSettings() {
  ensureDataDir();
  const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
  return JSON.parse(raw || '{}');
}

function saveSettings(settings) {
  ensureDataDir();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

function getAuth() {
  ensureDataDir();
  const raw = fs.readFileSync(AUTH_FILE, 'utf-8');
  return JSON.parse(raw || '{}');
}

function saveAuth(auth) {
  ensureDataDir();
  fs.writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2), 'utf-8');
}

module.exports = {
  getRunners,
  saveRunners,
  getJobs,
  saveJobs,
  getSettings,
  saveSettings,
  getAuth,
  saveAuth
};
