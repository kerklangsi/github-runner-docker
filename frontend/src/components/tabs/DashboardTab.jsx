import React from 'react';
import { 
  Cpu, Activity, HardDrive, Clock, Layers, Search, Plus 
} from 'lucide-react';
import RunnerCard from './RunnerCard';

export default function DashboardTab({
  system,
  runners,
  crashedCount,
  setStatusFilter,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  statusFilter,
  openAddModal,
  settings,
  editModeRunners,
  setEditModeRunners,
  runnerEdits,
  setRunnerEdits,
  showRunnerTokens,
  setShowRunnerTokens,
  unlockedRunnerTokens,
  setUnlockedRunnerTokens,
  handleUpdateRunnerInlineConfig,
  handleStart,
  handleStop,
  handleRestart,
  openLogs,
  handleExportRunnerConfig,
  openDeleteConfirmModal,
  fetchRunners,
  triggerToast,
  formatUptime
}) {
  const filteredRunners = runners.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.githubUrl && r.githubUrl.toLowerCase().includes(q)) ||
      (r.labels && r.labels.toLowerCase().includes(q)) ||
      (r.runnerGroup && r.runnerGroup.toLowerCase().includes(q))
    );
    const matchesStatus = statusFilter === 'ALL' || (
      statusFilter === 'ONLINE' ? (r.status === 'ONLINE' || r.status === 'IDLE' || r.status === 'BUSY') :
      statusFilter === 'OFFLINE' ? r.status === 'OFFLINE' :
      statusFilter === 'FAILED' ? (r.status === 'CRASHED' || r.status === 'FAILED' || r.status === 'UNHEALTHY') :
      r.status === statusFilter
    );
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Telemetry Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU Usage Card */}
        <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-[#8b949e]">CPU Usage</span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl font-bold text-white font-mono">{system.cpuUsage}%</span>
            </div>
          </div>
          <Cpu className="w-6 h-6 text-[#58a6ff]" />
        </div>

        {/* RAM Usage Card */}
        <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-[#8b949e]">RAM Usage</span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl font-bold text-white font-mono">{system.memUsage}%</span>
            </div>
          </div>
          <Activity className="w-6 h-6 text-[#3fb950]" />
        </div>

        {/* Disk Storage Card */}
        <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-[#8b949e]">Disk Storage</span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl font-bold text-white font-mono">{system.diskUsage}%</span>
            </div>
          </div>
          <HardDrive className="w-6 h-6 text-[#d29922]" />
        </div>

        {/* Container Uptime Card */}
        <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-[#8b949e]">Container Uptime</span>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{formatUptime(system.uptimeSeconds)}</div>
          </div>
          <Clock className="w-6 h-6 text-[#a371f7]" />
        </div>

        {/* 5th Telemetry Card: Runner Status Breakdown */}
        <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl flex flex-col justify-between col-span-1 md:col-span-2 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-[#8b949e] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#3fb950]" />
              Runner Status Breakdown (Click category to filter list)
            </span>
            <span className="text-xs text-white font-mono font-bold bg-[#21262d] px-2.5 py-1 rounded-md border border-[#30363d]">
              Total Registered: {runners.length}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-3 text-center">
            <button 
              onClick={() => { setStatusFilter('ONLINE'); setActiveTab('runners'); }}
              className="p-3 bg-[#1f6feb]/10 hover:bg-[#1f6feb]/20 border border-[#1f6feb]/30 rounded-xl text-xs font-mono transition group"
            >
              <div className="text-base font-bold text-[#58a6ff]">{runners.filter(r => r.status === 'ONLINE').length}</div>
              <div className="text-[11px] font-semibold text-[#8b949e] group-hover:text-white uppercase mt-0.5">Online</div>
            </button>

            <button 
              onClick={() => { setStatusFilter('ONLINE'); setActiveTab('runners'); }}
              className="p-3 bg-[#238636]/10 hover:bg-[#238636]/20 border border-[#238636]/30 rounded-xl text-xs font-mono transition group"
            >
              <div className="text-base font-bold text-[#3fb950]">{runners.filter(r => r.status === 'IDLE').length}</div>
              <div className="text-[11px] font-semibold text-[#8b949e] group-hover:text-white uppercase mt-0.5">Idle</div>
            </button>

            <button 
              onClick={() => { setStatusFilter('ONLINE'); setActiveTab('runners'); }}
              className="p-3 bg-[#d29922]/10 hover:bg-[#d29922]/20 border border-[#d29922]/30 rounded-xl text-xs font-mono transition group"
            >
              <div className="text-base font-bold text-[#d29922]">{runners.filter(r => r.status === 'BUSY').length}</div>
              <div className="text-[11px] font-semibold text-[#8b949e] group-hover:text-white uppercase mt-0.5">Busy</div>
            </button>

            <button 
              onClick={() => { setStatusFilter('OFFLINE'); setActiveTab('runners'); }}
              className="p-3 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-xl text-xs font-mono transition group"
            >
              <div className="text-base font-bold text-[#8b949e] group-hover:text-white">{runners.filter(r => r.status === 'OFFLINE').length}</div>
              <div className="text-[11px] font-semibold text-[#8b949e] group-hover:text-white uppercase mt-0.5">Offline</div>
            </button>

            <button 
              onClick={() => { setStatusFilter('FAILED'); setActiveTab('runners'); }}
              className="p-3 bg-[#da3633]/10 hover:bg-[#da3633]/20 border border-[#da3633]/30 rounded-xl text-xs font-mono transition group"
            >
              <div className="text-base font-bold text-[#f85149]">{crashedCount}</div>
              <div className="text-[11px] font-semibold text-[#8b949e] group-hover:text-white uppercase mt-0.5">Crashed</div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Section: Active Runner Containers & Quick Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#3fb950]" />
              Active Runner Containers
            </h2>
            {settings.showHeadlines && (
              <p className="text-xs text-[#8b949e] mt-1">Live status, container health, and rapid controls for active runner instances.</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search runners..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
              />
            </div>

            {/* Add Runner Button */}
            <button
              onClick={openAddModal}
              className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Runner
            </button>
          </div>
        </div>

        {/* Active Runners Grid */}
        {filteredRunners.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-white">No active runner containers match filters</p>
            <p className="text-xs text-[#8b949e]">Try adjusting search query or click (+) Add Runner to provision a new runner container instance.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRunners.map(runner => (
              <RunnerCard
                key={runner.id}
                runner={runner}
                settings={settings}
                editModeRunners={editModeRunners}
                setEditModeRunners={setEditModeRunners}
                runnerEdits={runnerEdits}
                setRunnerEdits={setRunnerEdits}
                showRunnerTokens={showRunnerTokens}
                setShowRunnerTokens={setShowRunnerTokens}
                unlockedRunnerTokens={unlockedRunnerTokens}
                setUnlockedRunnerTokens={setUnlockedRunnerTokens}
                handleUpdateRunnerInlineConfig={handleUpdateRunnerInlineConfig}
                handleStart={handleStart}
                handleStop={handleStop}
                handleRestart={handleRestart}
                openLogs={openLogs}
                handleExportRunnerConfig={handleExportRunnerConfig}
                openDeleteConfirmModal={openDeleteConfirmModal}
                fetchRunners={fetchRunners}
                triggerToast={triggerToast}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
