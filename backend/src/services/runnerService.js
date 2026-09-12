const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const db = require('../db/database');

const BASE_RUNNERS_DIR = process.env.RUNNERS_DIR || '/opt/github-runners';

function ensureBaseDir() {
  if (!fs.existsSync(BASE_RUNNERS_DIR)) {
    fs.mkdirSync(BASE_RUNNERS_DIR, { recursive: true });
  }
}

function getAllRunners() {
  const runners = db.getRunners();
  return runners.map(runner => {
    const updated = checkRunnerProcessState(runner);
    return updated;
  });
}

function checkRunnerProcessState(runner) {
  let isAlive = false;
  if (runner.pid) {
    if (fs.existsSync(`/proc/${runner.pid}`)) {
      isAlive = true;
    }
  }

  let status = "OFFLINE";
  if (isAlive) {
    status = "ONLINE";
    // Read diagnostic logs to determine if executing a job or idle
    const diagDir = path.join(runner.dir, 'actions-runner', '_diag');
    if (fs.existsSync(diagDir)) {
      const files = fs.readdirSync(diagDir).filter(f => f.startsWith('Runner_'));
      if (files.length > 0) {
        files.sort((a, b) => fs.statSync(path.join(diagDir, b)).mtimeMs - fs.statSync(path.join(diagDir, a)).mtimeMs);
        const latestLog = fs.readFileSync(path.join(diagDir, files[0]), 'utf-8');
        if (latestLog.includes('Running job:')) {
          status = "BUSY";
        } else if (latestLog.includes('Listening for Jobs')) {
          status = "IDLE";
        }
      }
    }
  } else if (runner.lastState === "ONLINE" || runner.lastState === "BUSY" || runner.lastState === "IDLE") {
    status = "CRASHED";
  }

  runner.status = status;
  return runner;
}

function getRunnerById(id) {
  const runners = getAllRunners();
  return runners.find(r => r.id === id) || null;
}

function createRunner(options) {
  ensureBaseDir();
  const id = `runner-${Date.now()}`;
  const sanitizedName = options.name.replace(/[^a-zA-Z0-9_-]/g, '') || `runner-${Date.now().toString().slice(-4)}`;
  const runnerDir = path.join(BASE_RUNNERS_DIR, sanitizedName);

  if (fs.existsSync(runnerDir)) {
    return { error: `Runner directory '${sanitizedName}' already exists.` };
  }

  const actionsRunnerDir = path.join(runnerDir, 'actions-runner');
  const workDir = path.join(runnerDir, '_work');
  const logsDir = path.join(runnerDir, 'logs');

  fs.mkdirSync(actionsRunnerDir, { recursive: true });
  fs.mkdirSync(workDir, { recursive: true });
  fs.mkdirSync(logsDir, { recursive: true });

  // Copy base runner binaries
  const baseSource = '/actions-runner';
  if (fs.existsSync(baseSource) && fs.existsSync(path.join(baseSource, 'config.sh'))) {
    execSync(`cp -rn ${baseSource}/* ${actionsRunnerDir}/ || true`);
  }

  let regToken = options.registrationToken || options.token;
  if (regToken && (regToken.startsWith('ghp_') || regToken.startsWith('github_pat_') || options.tokenType === 'pat')) {
    const targetUrlClean = (options.githubUrl || '').replace(/\/$/, '');
    let apiUrl = '';
    const orgMatch = targetUrlClean.match(/https:\/\/github\.com\/orgs\/([^/]+)/);
    const repoMatch = targetUrlClean.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/);
    if (orgMatch) {
      apiUrl = `https://api.github.com/orgs/${orgMatch[1]}/actions/runners/registration-token`;
    } else if (repoMatch) {
      apiUrl = `https://api.github.com/repos/${repoMatch[1]}/${repoMatch[2]}/actions/runners/registration-token`;
    }
    if (apiUrl) {
      const curlCmd = `curl -s -X POST -H "Authorization: token ${regToken}" -H "Accept: application/vnd.github+json" "${apiUrl}"`;
      const tokenRes = execSync(curlCmd, { encoding: 'utf-8' });
      const parsed = JSON.parse(tokenRes || '{}');
      if (parsed.token) {
        regToken = parsed.token;
      }
    }
  }

  // Configure runner
  const runnerGroupArg = options.runnerGroup ? `--runnergroup "${options.runnerGroup}"` : '';
  const configCmd = `./config.sh --url "${options.githubUrl}" --token "${regToken}" --name "${sanitizedName}" --labels "${options.labels || 'self-hosted,linux,x64'}" ${runnerGroupArg} --work "${workDir}" --unattended --replace`;
  
  let configLog = "";
  const output = execSync(configCmd, { cwd: actionsRunnerDir, encoding: 'utf-8', stdio: 'pipe' });
  configLog = output;

  const runnerRecord = {
    id,
    name: sanitizedName,
    githubUrl: options.githubUrl,
    labels: options.labels || 'self-hosted,linux,x64',
    runnerGroup: options.runnerGroup || 'Default',
    dir: runnerDir,
    workDir,
    pid: null,
    status: 'OFFLINE',
    lastState: 'OFFLINE',
    createdDate: new Date().toISOString(),
    version: '2.337.0'
  };

  const runners = db.getRunners();
  runners.push(runnerRecord);
  db.saveRunners(runners);

  // Automatically start newly created runner
  startRunner(id);

  return { success: true, runner: runnerRecord };
}

function startRunner(id) {
  const runners = db.getRunners();
  const runnerIndex = runners.findIndex(r => r.id === id);
  if (runnerIndex === -1) return { error: 'Runner not found' };

  const runner = runners[runnerIndex];
  const actionsRunnerDir = path.join(runner.dir, 'actions-runner');
  const logFilePath = path.join(runner.dir, 'logs', 'runner.log');

  const outStream = fs.openSync(logFilePath, 'a');
  
  const child = spawn('./run.sh', [], {
    cwd: actionsRunnerDir,
    detached: true,
    stdio: ['ignore', outStream, outStream]
  });

  child.unref();

  runner.pid = child.pid;
  runner.status = 'ONLINE';
  runner.lastState = 'ONLINE';
  runners[runnerIndex] = runner;
  db.saveRunners(runners);

  return { success: true, pid: child.pid };
}

function stopRunner(id) {
  const runners = db.getRunners();
  const runnerIndex = runners.findIndex(r => r.id === id);
  if (runnerIndex === -1) return { error: 'Runner not found' };

  const runner = runners[runnerIndex];
  if (runner.pid) {
    execSync(`kill -15 ${runner.pid} || kill -9 ${runner.pid} || true`);
  }

  runner.pid = null;
  runner.status = 'OFFLINE';
  runner.lastState = 'OFFLINE';
  runners[runnerIndex] = runner;
  db.saveRunners(runners);

  return { success: true };
}

function restartRunner(id) {
  stopRunner(id);
  return startRunner(id);
}

function removeRunner(id, removeWorkDir = false) {
  stopRunner(id);
  const runners = db.getRunners();
  const runnerIndex = runners.findIndex(r => r.id === id);
  if (runnerIndex === -1) return { error: 'Runner not found' };

  const runner = runners[runnerIndex];

  if (fs.existsSync(runner.dir)) {
    if (removeWorkDir) {
      execSync(`rm -rf ${runner.dir} || true`);
    } else {
      const actionsRunnerDir = path.join(runner.dir, 'actions-runner');
      execSync(`rm -rf ${actionsRunnerDir} || true`);
    }
  }

  runners.splice(runnerIndex, 1);
  db.saveRunners(runners);

  return { success: true };
}

module.exports = {
  getAllRunners,
  getRunnerById,
  createRunner,
  startRunner,
  stopRunner,
  restartRunner,
  removeRunner
};
