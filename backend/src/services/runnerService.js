const fs = require('fs');
const path = require('path');
const { spawn, spawnSync, execSync } = require('child_process');
const db = require('../db/database');
const logService = require('./logService');

const BASE_RUNNERS_DIR = process.env.RUNNERS_DIR || '/opt/github-runners';

function ensureBaseDir() {
  if (!fs.existsSync(BASE_RUNNERS_DIR)) {
    fs.mkdirSync(BASE_RUNNERS_DIR, { recursive: true });
  }
}

function getRunnerDir(runner) {
  if (!runner) return BASE_RUNNERS_DIR;
  return runner.dir || runner.runner_dir || runner.runnerDir || path.join(BASE_RUNNERS_DIR, runner.name || 'runner');
}

function getAllRunners() {
  const runners = db.getRunners();
  return runners.map(runner => {
    const updated = checkRunnerProcessState(runner);
    return updated;
  });
}

function checkRunnerProcessState(runner) {
  if (runner.status === 'PROVISIONING') {
    return runner;
  }

  let isAlive = false;
  if (runner.pid) {
    if (fs.existsSync(`/proc/${runner.pid}`)) {
      isAlive = true;
    }
  }

  const runnerDir = getRunnerDir(runner);
  let status = "OFFLINE";
  if (isAlive) {
    status = "ONLINE";
    const diagDir = path.join(runnerDir, 'actions-runner', '_diag');
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
  const rawName = (options.name || '').trim();
  const sanitizedName = rawName.replace(/[^a-zA-Z0-9_-]/g, '') || `runner-${Date.now().toString().slice(-4)}`;
  const runnerDir = path.join(BASE_RUNNERS_DIR, sanitizedName);

  logService.addSystemLog('INFO', `Provisioning runner container '${sanitizedName}' targeting ${options.githubUrl}...`);

  const activeRunners = db.getRunners();
  const isAlreadyTracked = activeRunners.some(r => r.name === sanitizedName || r.dir === runnerDir);

  if (isAlreadyTracked) {
    logService.addSystemLog('ERROR', `Runner registration failed: A runner named '${sanitizedName}' is already registered.`);
    return { error: `A runner named '${sanitizedName}' is already registered.` };
  }

  // If a stale directory exists on disk but is not tracked in DB, clean it up
  if (fs.existsSync(runnerDir)) {
    execSync(`rm -rf ${runnerDir} || true`);
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

  const runnerRecord = {
    id,
    name: sanitizedName,
    githubUrl: options.githubUrl,
    registrationToken: options.registrationToken || options.token || '',
    labels: options.labels || 'self-hosted,linux,x64',
    runnerGroup: options.runnerGroup || 'Default',
    dir: runnerDir,
    workDir,
    pid: null,
    status: 'PROVISIONING',
    lastState: 'PROVISIONING',
    createdDate: new Date().toISOString(),
    version: '2.337.0'
  };

  const runners = db.getRunners();
  runners.push(runnerRecord);
  db.saveRunners(runners);

  logService.addSystemLog('INFO', `Runner container slot '${sanitizedName}' created in background. Starting GitHub registration...`);

  // Asynchronous background registration
  setImmediate(() => {
    try {
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
          try {
            const curlCmd = `curl -s -X POST -H "Authorization: token ${regToken}" -H "Accept: application/vnd.github+json" "${apiUrl}"`;
            const tokenRes = execSync(curlCmd, { encoding: 'utf-8' });
            const parsed = JSON.parse(tokenRes || '{}');
            if (parsed.token) {
              regToken = parsed.token;
            }
          } catch (e) {
            logService.addSystemLog('WARN', `Failed to exchange GitHub PAT for registration token: ${e.message}`);
          }
        }
      }

      const cleanLabels = (options.labels || 'self-hosted,linux,x64')
        .split(',')
        .map(l => l.trim())
        .filter(Boolean)
        .join(',');

      const configArgs = [
        '--url', options.githubUrl,
        '--token', regToken,
        '--name', sanitizedName,
        '--labels', cleanLabels,
        '--work', workDir,
        '--unattended',
        '--replace'
      ];
      if (options.runnerGroup) {
        configArgs.push('--runnergroup', options.runnerGroup);
      }

      const child = spawn('./config.sh', configArgs, { cwd: actionsRunnerDir });
      let output = '';
      child.stdout.on('data', d => { output += d.toString(); });
      child.stderr.on('data', d => { output += d.toString(); });

      child.on('close', code => {
        const currentRunners = db.getRunners();
        const rIndex = currentRunners.findIndex(r => r.id === id);
        if (rIndex === -1) return;

        if (code === 0) {
          logService.addSystemLog('INFO', `Successfully registered runner container '${sanitizedName}' targeting ${options.githubUrl}`);
          currentRunners[rIndex].status = 'OFFLINE';
          currentRunners[rIndex].lastState = 'OFFLINE';
          delete currentRunners[rIndex].lastError;
          db.saveRunners(currentRunners);
          startRunner(id);
        } else {
          let userMsg = 'Runner registration failed on GitHub.';
          if (output.includes('404')) {
            userMsg = 'GitHub returned 404 Not Found. Check your Target Repository URL or Token permissions.';
          } else if (output.includes('401') || output.includes('Unauthorized')) {
            userMsg = 'GitHub authentication failed. Your Token is invalid or expired.';
          }
          logService.addSystemLog('ERROR', `Failed to register runner '${sanitizedName}': ${userMsg}`);
          currentRunners[rIndex].status = 'OFFLINE';
          currentRunners[rIndex].lastError = userMsg;
          db.saveRunners(currentRunners);

          try {
            const logDir = path.join(runnerDir, 'logs');
            if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
            fs.appendFileSync(path.join(logDir, 'runner.log'), `\n[ERROR] Configuration / Runtime Error: ${userMsg}\n`);
          } catch (e) {}
        }
      });
    } catch (err) {
      logService.addSystemLog('ERROR', `Exception during background provisioning for '${sanitizedName}': ${err.message}`);
      const currentRunners = db.getRunners();
      const rIndex = currentRunners.findIndex(r => r.id === id);
      if (rIndex !== -1) {
        currentRunners[rIndex].status = 'OFFLINE';
        currentRunners[rIndex].lastError = err.message;
        db.saveRunners(currentRunners);
      }
    }
  });

  return { success: true, runner: runnerRecord };
}

function startRunner(id) {
  const runners = db.getRunners();
  const runnerIndex = runners.findIndex(r => r.id === id);
  if (runnerIndex === -1) return { error: 'Runner not found' };

  const runner = runners[runnerIndex];
  const runnerDir = getRunnerDir(runner);
  const actionsRunnerDir = path.join(runnerDir, 'actions-runner');
  const runnerConfigFile = path.join(actionsRunnerDir, '.runner');

  // Check if runner process is already running to prevent duplicate sessions
  if (runner.pid) {
    try {
      process.kill(runner.pid, 0);
      return { success: true, message: `Runner '${runner.name}' is already running.`, pid: runner.pid };
    } catch (e) {
      runner.pid = null;
    }
  }

  if (!fs.existsSync(runnerConfigFile)) {
    const errorMsg = runner.lastError || 'Runner is not configured with GitHub. Please provide a valid registration token.';
    logService.addSystemLog('WARN', `Cannot start runner '${runner.name}': ${errorMsg}`);
    runner.status = 'CRASHED';
    runner.lastError = errorMsg;
    runners[runnerIndex] = runner;
    db.saveRunners(runners);

    try {
      const logDir = path.join(runnerDir, 'logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      fs.appendFileSync(path.join(logDir, 'runner.log'), `\n[ERROR] Configuration / Runtime Error: ${errorMsg}\n`);
    } catch (e) {}

    return { error: errorMsg };
  }

  const logsDir = path.join(runnerDir, 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

  const logFilePath = path.join(logsDir, 'runner.log');

  // Truncate the log file on each fresh start so previous session logs don't bleed in
  fs.writeFileSync(logFilePath, '');

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
  delete runner.lastError;
  runners[runnerIndex] = runner;
  db.saveRunners(runners);

  logService.addSystemLog('INFO', `Sent START command to runner container '${runner.name}' (PID: ${child.pid}).`);

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

  logService.addSystemLog('INFO', `Sent STOP command to runner container '${runner.name}'.`);

  return { success: true };
}

function restartRunner(id) {
  logService.addSystemLog('INFO', `Sent RESTART command to runner container ID '${id}'.`);
  stopRunner(id);
  return startRunner(id);
}

function removeRunner(id, removeWorkDir = false) {
  stopRunner(id);
  const runners = db.getRunners();
  const runnerIndex = runners.findIndex(r => r.id === id);
  if (runnerIndex === -1) {
    logService.addSystemLog('WARN', `Attempted to delete runner ID '${id}' but runner was not registered or already removed.`);
    return { error: 'Runner not found' };
  }

  const runner = runners[runnerIndex];

  // Archive runner logs to persistent data directory before deletion
  try {
    const archiveBase = path.join(process.env.DATA_DIR || '/app/data', 'archived-logs', runner.name || id);
    if (!fs.existsSync(archiveBase)) {
      fs.mkdirSync(archiveBase, { recursive: true });
    }
    const runnerLog = path.join(runner.dir, 'logs', 'runner.log');
    if (fs.existsSync(runnerLog)) {
      fs.copyFileSync(runnerLog, path.join(archiveBase, 'runner.log'));
    }
    const diagDir = path.join(runner.dir, 'actions-runner', '_diag');
    if (fs.existsSync(diagDir)) {
      const archiveDiag = path.join(archiveBase, '_diag');
      if (!fs.existsSync(archiveDiag)) fs.mkdirSync(archiveDiag, { recursive: true });
      const files = fs.readdirSync(diagDir).filter(f => f.startsWith('Runner_') || f.startsWith('Worker_'));
      files.forEach(f => {
        try {
          fs.copyFileSync(path.join(diagDir, f), path.join(archiveDiag, f));
        } catch (e) {}
      });
    }
    logService.addSystemLog('INFO', `Archived logs for runner '${runner.name || id}' to /app/data/archived-logs/${runner.name || id}/`);
  } catch (err) {
    // ignore archive errors
  }

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

  logService.addSystemLog('INFO', `Deleted runner container '${runner.name}' (ID: ${id}).`);

  return { success: true };
}

function updateRunnerConfig(id, config) {
  const runners = db.getRunners();
  const index = runners.findIndex(r => r.id === id);
  if (index === -1) return { error: 'Runner not found' };

  const runner = runners[index];
  if (config.name) runner.name = config.name;
  if (config.githubUrl) runner.githubUrl = config.githubUrl;
  if (config.token || config.registrationToken) runner.registrationToken = config.token || config.registrationToken;
  if (config.labels) runner.labels = config.labels;
  if (config.runnerGroup) runner.runnerGroup = config.runnerGroup;

  runners[index] = runner;
  db.saveRunners(runners);

  logService.addSystemLog('INFO', `Updated configuration settings for runner container '${runner.name}'.`);
  return { success: true, runner };
}

function startAllRunners() {
  const runners = db.getRunners();
  const results = runners.map(r => startRunner(r.id));
  logService.addSystemLog('INFO', `Sent START ALL command to all (${results.length}) runner containers.`);
  return { success: true, count: results.length };
}

function stopAllRunners() {
  const runners = db.getRunners();
  const results = runners.map(r => stopRunner(r.id));
  logService.addSystemLog('INFO', `Sent STOP ALL command to all (${results.length}) runner containers.`);
  return { success: true, count: results.length };
}

module.exports = {
  getAllRunners,
  getRunnerById,
  createRunner,
  updateRunnerConfig,
  startRunner,
  stopRunner,
  restartRunner,
  removeRunner,
  startAllRunners,
  stopAllRunners
};
