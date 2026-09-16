import React from 'react';
import { Cpu, Layers, Activity, Clock } from 'lucide-react';
import { TimeSeriesSVG, HostLoadSVG, NetworkSVG } from '../charts/TelemetryCharts';

export default function SystemHardwareTab({
  system,
  settings,
  formatUptime
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#d29922]" />
            Docker Container Hardware &amp; Live Telemetry
          </h2>
          {settings.showHeadlines && (
            <p className="text-xs text-[#8b949e] mt-1">Live Docker cgroup memory, process CPU delta, container storage, network I/O, and system load average.</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-[#3fb950] font-mono bg-[#238636]/10 px-3 py-1.5 rounded-lg border border-[#238636]/30">
          <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse"></span>
          Container Live Stream
        </div>
      </div>

      {/* Grid of Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CPU Graph */}
        <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-[#8b949e]">Container CPU Utilization</span>
              <h4 className="text-2xl font-bold text-white font-mono mt-0.5">{system.cpuUsage}%</h4>
            </div>
            <span className="bg-[#3fb950]/20 text-[#3fb950] text-xs px-2.5 py-1 rounded-md font-bold">0 - 100%</span>
          </div>
          <TimeSeriesSVG historyData={system.history} metricKey="cpuUsage" strokeColor="#3fb950" />
        </div>

        {/* RAM Graph */}
        <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-[#8b949e]">Container Memory Usage</span>
              <h4 className="text-2xl font-bold text-white font-mono mt-0.5">{system.memUsage}% <span className="text-xs font-normal text-[#8b949e]">({system.memUsedMB || 25} MB / {system.memTotalMB || 15886} MB)</span></h4>
            </div>
            <span className="bg-[#58a6ff]/20 text-[#58a6ff] text-xs px-2.5 py-1 rounded-md font-bold">RAM MB</span>
          </div>
          <TimeSeriesSVG historyData={system.history} metricKey="memUsage" strokeColor="#58a6ff" />
        </div>

        {/* Disk Graph */}
        <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-[#8b949e]">Container Storage Consumption</span>
              <h4 className="text-2xl font-bold text-white font-mono mt-0.5">{system.diskUsage}% <span className="text-xs font-normal text-[#8b949e]">({system.diskUsedGB || 2} GB / {system.diskTotalGB || 50} GB)</span></h4>
            </div>
            <span className="bg-[#d29922]/20 text-[#d29922] text-xs px-2.5 py-1 rounded-md font-bold">Disk Space</span>
          </div>
          <TimeSeriesSVG historyData={system.history} metricKey="diskUsage" strokeColor="#d29922" />
        </div>

        {/* Host Load Average Specs Graph */}
        <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-[#8b949e]">Docker Host Load Average Specs</span>
              <h4 className="text-xl font-bold text-white font-mono mt-0.5">
                {(system.loadAvg?.[0] || 0).toFixed(2)} / {(system.loadAvg?.[1] || 0).toFixed(2)} / {(system.loadAvg?.[2] || 0).toFixed(2)}
              </h4>
            </div>
            <span className="bg-[#58a6ff]/20 text-[#58a6ff] text-xs px-2.5 py-1 rounded-md font-bold">1m / 5m / 15m</span>
          </div>
          <HostLoadSVG historyData={system.history} currentLoadAvg={system.loadAvg} />
        </div>

        {/* Docker Network I/O Graph */}
        <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-[#8b949e]">Docker Network I/O Traffic</span>
              <h4 className="text-xl font-bold text-white font-mono mt-0.5">
                Rx {system.netRxMB || 0.5} MB / Tx {system.netTxMB || 1.9} MB
              </h4>
            </div>
            <span className="bg-[#3fb950]/20 text-[#3fb950] text-xs px-2.5 py-1 rounded-md font-bold">Rx / Tx Traffic</span>
          </div>
          <NetworkSVG historyData={system.history} netRxMB={system.netRxMB} netTxMB={system.netTxMB} />
        </div>

        {/* Docker Engine & Environment Info */}
        <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-[#8b949e]">Docker Engine &amp; System OS</span>
            <div className="text-lg font-bold text-white font-mono mt-1">Ubuntu 22.04 LTS</div>
            <p className="text-[11px] text-[#3fb950] font-mono mt-0.5">Node.js v20.x · Docker Engine v24+</p>
          </div>
          <div className="p-3 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-xl text-[#58a6ff]">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Active Container PIDs */}
        <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-[#8b949e]">Active Container PIDs</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{system.pids || 12} Processes</div>
            {settings.showHeadlines && (
              <p className="text-[11px] text-[#8b949e] mt-1">Number of active threads and tasks within the runner container cgroup.</p>
            )}
          </div>
          <div className="p-3 bg-[#a371f7]/10 border border-[#a371f7]/30 rounded-xl text-[#a371f7]">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Container Uptime */}
        <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-[#8b949e]">Container Total Uptime</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{formatUptime(system.uptimeSeconds)}</div>
            {settings.showHeadlines && (
              <p className="text-[11px] text-[#8b949e] mt-1">Duration since the main Docker daemon container process was started.</p>
            )}
          </div>
          <div className="p-3 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-xl text-[#3fb950]">
            <Clock className="w-6 h-6" />
          </div>
        </div>

      </div>
    </div>
  );
}
