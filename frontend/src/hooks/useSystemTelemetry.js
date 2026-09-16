import { useState } from 'react';

export function useSystemTelemetry() {
  const [system, setSystem] = useState({ 
    cpuUsage: 0.45, 
    memUsage: 0.16, 
    memUsedMB: 25,
    memTotalMB: 15886,
    diskUsage: 4, 
    diskUsedGB: 2,
    diskTotalGB: 50,
    netRxMB: 0.5,
    netTxMB: 1.9,
    pids: 12,
    uptimeSeconds: 0,
    loadAvg: [0.05, 0.52, 0.51],
    history: []
  });

  function fetchSystem() {
    fetch('/api/system')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setSystem(data);
      });
  }

  return { system, setSystem, fetchSystem };
}
