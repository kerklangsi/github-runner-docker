import React from 'react';

/**
 * Single-metric TimeSeries SVG Chart (CPU, RAM, Disk)
 */
export function TimeSeriesSVG({ historyData = [], metricKey = 'cpuUsage', strokeColor = '#3fb950' }) {
  if (historyData.length < 2) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-[#8b949e]">
        Sampling telemetry history data...
      </div>
    );
  }

  const width = 500;
  const height = 140;
  const values = historyData.map(d => d[metricKey] || 0);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const spread = Math.max(0.5, maxVal - minVal);
  const yMin = Math.max(0, minVal - spread * 0.2);
  const yMax = maxVal + spread * 0.2;

  const points = historyData.map((d, i) => {
    const x = (i / (historyData.length - 1)) * width;
    const val = d[metricKey] || 0;
    const y = height - ((val - yMin) / (yMax - yMin || 1)) * (height - 30) - 15;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
        <defs>
          <linearGradient id={`grad-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="20" x2={width} y2="20" stroke="#30363d" strokeDasharray="3 3" />
        <line x1="0" y1="70" x2={width} y2="70" stroke="#30363d" strokeDasharray="3 3" />
        <line x1="0" y1="120" x2={width} y2="120" stroke="#30363d" strokeDasharray="3 3" />
        <polygon points={areaPoints} fill={`url(#grad-${metricKey})`} />
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}

/**
 * 3-Line Host Load Average SVG Chart (1m, 5m, 15m)
 */
export function HostLoadSVG({ historyData = [], currentLoadAvg = [0, 0, 0] }) {
  if (historyData.length < 2) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-[#8b949e]">
        Sampling host load average history...
      </div>
    );
  }

  const width = 500;
  const height = 140;
  const allVals = historyData.flatMap(d => d.loadAvg || [0, 0, 0]);
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const spread = Math.max(0.05, maxVal - minVal);
  const yMin = Math.max(0, minVal - spread * 0.25);
  const yMax = maxVal + spread * 0.25;

  const getPoints = (idx) => historyData.map((d, i) => {
    const x = (i / (historyData.length - 1)) * width;
    const val = (d.loadAvg && d.loadAvg[idx]) || 0;
    const y = height - ((val - yMin) / (yMax - yMin || 1)) * (height - 30) - 15;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-end gap-4 text-[11px] font-mono">
        <span className="flex items-center gap-1 text-[#58a6ff]"><span className="w-2 h-2 rounded-full bg-[#58a6ff]"></span> 1m: {(currentLoadAvg[0] || 0).toFixed(2)}</span>
        <span className="flex items-center gap-1 text-[#3fb950]"><span className="w-2 h-2 rounded-full bg-[#3fb950]"></span> 5m: {(currentLoadAvg[1] || 0).toFixed(2)}</span>
        <span className="flex items-center gap-1 text-[#d29922]"><span className="w-2 h-2 rounded-full bg-[#d29922]"></span> 15m: {(currentLoadAvg[2] || 0).toFixed(2)}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
        <line x1="0" y1="20" x2={width} y2="20" stroke="#30363d" strokeDasharray="3 3" />
        <line x1="0" y1="70" x2={width} y2="70" stroke="#30363d" strokeDasharray="3 3" />
        <line x1="0" y1="120" x2={width} y2="120" stroke="#30363d" strokeDasharray="3 3" />
        <polyline fill="none" stroke="#58a6ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={getPoints(0)} />
        <polyline fill="none" stroke="#3fb950" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={getPoints(1)} />
        <polyline fill="none" stroke="#d29922" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" strokeLinejoin="round" points={getPoints(2)} />
      </svg>
    </div>
  );
}

/**
 * 2-Line Network I/O SVG Chart (Rx, Tx)
 */
export function NetworkSVG({ historyData = [], netRxMB = 0.5, netTxMB = 1.9 }) {
  if (historyData.length < 2) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-[#8b949e]">
        Sampling network I/O traffic history...
      </div>
    );
  }

  const width = 500;
  const height = 140;
  const rxVals = historyData.map(d => d.netRxMB || 0);
  const txVals = historyData.map(d => d.netTxMB || 0);
  const allVals = [...rxVals, ...txVals];
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const spread = Math.max(0.1, maxVal - minVal);
  const yMin = Math.max(0, minVal - spread * 0.2);
  const yMax = maxVal + spread * 0.2;

  const pointsRx = historyData.map((d, i) => {
    const x = (i / (historyData.length - 1)) * width;
    const val = d.netRxMB || 0;
    const y = height - ((val - yMin) / (yMax - yMin || 1)) * (height - 30) - 15;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const pointsTx = historyData.map((d, i) => {
    const x = (i / (historyData.length - 1)) * width;
    const val = d.netTxMB || 0;
    const y = height - ((val - yMin) / (yMax - yMin || 1)) * (height - 30) - 15;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-end gap-4 text-[11px] font-mono">
        <span className="flex items-center gap-1 text-[#3fb950]"><span className="w-2 h-2 rounded-full bg-[#3fb950]"></span> Rx: {netRxMB} MB</span>
        <span className="flex items-center gap-1 text-[#58a6ff]"><span className="w-2 h-2 rounded-full bg-[#58a6ff]"></span> Tx: {netTxMB} MB</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
        <line x1="0" y1="20" x2={width} y2="20" stroke="#30363d" strokeDasharray="3 3" />
        <line x1="0" y1="70" x2={width} y2="70" stroke="#30363d" strokeDasharray="3 3" />
        <line x1="0" y1="120" x2={width} y2="120" stroke="#30363d" strokeDasharray="3 3" />
        <polyline fill="none" stroke="#3fb950" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pointsRx} />
        <polyline fill="none" stroke="#58a6ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pointsTx} />
      </svg>
    </div>
  );
}
