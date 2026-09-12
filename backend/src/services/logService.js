const fs = require('fs');
const path = require('path');
const runnerService = require('./runnerService');

function getRunnerLogs(runnerId, options = {}) {
  const runner = runnerService.getRunnerById(runnerId);
  if (!runner) return { lines: ['Runner not found.'] };

  const logFile = path.join(runner.dir, 'logs', 'runner.log');
  let lines = [];

  if (fs.existsSync(logFile)) {
    const raw = fs.readFileSync(logFile, 'utf-8');
    lines = raw.split('\n').filter(l => l.trim().length > 0);
  }

  // Also check _diag logs
  const diagDir = path.join(runner.dir, 'actions-runner', '_diag');
  if (fs.existsSync(diagDir)) {
    const files = fs.readdirSync(diagDir).filter(f => f.startsWith('Runner_'));
    if (files.length > 0) {
      files.sort((a, b) => fs.statSync(path.join(diagDir, b)).mtimeMs - fs.statSync(path.join(diagDir, a)).mtimeMs);
      const diagRaw = fs.readFileSync(path.join(diagDir, files[0]), 'utf-8');
      const diagLines = diagRaw.split('\n').filter(l => l.trim().length > 0);
      lines = lines.concat(diagLines.slice(-100));
    }
  }

  if (options.search) {
    const query = options.search.toLowerCase();
    lines = lines.filter(l => l.toLowerCase().includes(query));
  }

  if (options.level) {
    const lvl = options.level.toUpperCase();
    lines = lines.filter(l => l.toUpperCase().includes(lvl));
  }

  const limit = options.limit ? parseInt(options.limit, 10) : 200;
  return { lines: lines.slice(-limit) };
}

module.exports = {
  getRunnerLogs
};
