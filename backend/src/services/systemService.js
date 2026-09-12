const os = require('os');
const fs = require('fs');

let cachedMetrics = {
  cpuUsage: 0,
  memUsage: 0,
  memUsedMB: 0,
  memTotalMB: 0,
  diskUsage: 0,
  diskUsedGB: 0,
  diskTotalGB: 0,
  uptimeSeconds: 0,
  loadAvg: [0, 0, 0]
};

function updateMetrics() {
  const totalMem = os.totalmem() || 1;
  const freeMem = os.freemem() || 0;
  const usedMem = totalMem - freeMem;
  
  const cpus = os.cpus() || [];
  let user = 0, sys = 0, idle = 0;
  cpus.forEach(cpu => {
    user += cpu.times.user;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
  });
  const total = user + sys + idle;
  const cpuUsage = total > 0 ? Math.round(((user + sys) / total) * 100) : 0;
  const uptimeSeconds = Math.round(os.uptime() || 0);

  let diskUsage = 15;
  let diskUsedGB = 5;
  let diskTotalGB = 50;

  if (fs.statfsSync) {
    const stats = fs.statfsSync('/');
    if (stats && stats.blocks) {
      const totalBlocks = stats.blocks * stats.bsize;
      const freeBlocks = stats.bfree * stats.bsize;
      const usedBlocks = totalBlocks - freeBlocks;
      diskUsage = Math.round((usedBlocks / totalBlocks) * 100);
      diskUsedGB = Math.round(usedBlocks / (1024 * 1024 * 1024));
      diskTotalGB = Math.round(totalBlocks / (1024 * 1024 * 1024));
    }
  }

  cachedMetrics = {
    cpuUsage: Math.min(100, Math.max(0, cpuUsage)),
    memUsage: Math.round((usedMem / totalMem) * 100),
    memUsedMB: Math.round(usedMem / (1024 * 1024)),
    memTotalMB: Math.round(totalMem / (1024 * 1024)),
    diskUsage,
    diskUsedGB,
    diskTotalGB,
    uptimeSeconds,
    loadAvg: os.loadavg() || [0, 0, 0]
  };
}

updateMetrics();
setInterval(updateMetrics, 2000);

function getSystemMetrics(callback) {
  callback(null, cachedMetrics);
}

module.exports = {
  getSystemMetrics
};
