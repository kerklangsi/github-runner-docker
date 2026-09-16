'use strict';
const logService = require('./logService');

let watchdogTimer = null;
let watchdogSettings = { enabled: false, intervalSec: 30 };

function updateSettings(settings) {
  watchdogSettings = {
    enabled: !!settings.watchdogEnabled,
    intervalSec: parseInt(settings.watchdogIntervalSec, 10) || 30
  };
  restartWatchdog();
}

function restartWatchdog() {
  if (watchdogTimer) { clearInterval(watchdogTimer); watchdogTimer = null; }
  if (watchdogSettings.enabled) {
    watchdogTimer = setInterval(runWatchdog, watchdogSettings.intervalSec * 1000);
    logService.addSystemLog('INFO', `Auto-Restart Watchdog started (interval: ${watchdogSettings.intervalSec}s)`);
  }
}

async function runWatchdog() {
  try {
    const runnerService = require('./runnerService');
    const runners = runnerService.getAllRunners();
    for (const runner of runners) {
      if (!runner.watchdog) continue;
      const status = runner.status;
      if (status === 'OFFLINE' || status === 'CRASHED' || status === 'ERROR') {
        logService.addSystemLog('WARN', `[Watchdog] Runner '${runner.name}' is ${status} - auto-restarting...`);
        try {
          await runnerService.startRunner(runner.id);
          logService.addSystemLog('INFO', `[Watchdog] Runner '${runner.name}' restart triggered.`);
        } catch (e) {
          logService.addSystemLog('ERROR', `[Watchdog] Failed to restart '${runner.name}': ${e.message}`);
        }
      }
    }
  } catch (e) {
    logService.addSystemLog('ERROR', `[Watchdog] Error during watchdog cycle: ${e.message}`);
  }
}

module.exports = { updateSettings, restartWatchdog };
