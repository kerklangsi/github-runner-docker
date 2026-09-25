import React from 'react';
import { 
  Activity, Layers, FileText, Clock, Terminal, Cpu, Settings, 
  ChevronLeft, ChevronRight, Info, CheckCircle2, Folder 
} from 'lucide-react';

// Renders the side navigation menu and container version badge
export default function Sidebar({
  activeTab,
  setActiveTab,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  totalRunners,
  fetchGlobalLogs,
  fetchWorkflows,
  fetchSettings,
  setStatusFilter,
  setIsAboutModalOpen,
  versionInfo
}) {
  return (
    <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-[#161b22] border-r border-[#30363d] p-3 flex flex-col justify-between transition-all duration-300 z-10 shrink-0`}>
      <div className="space-y-4">
        {/* Sidebar Header & Collapse Toggle */}
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-2'} pt-1`}>
          {!isSidebarCollapsed && (
            <span className="text-xs font-bold text-[#8b949e] uppercase tracking-wider">
              Navigation
            </span>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 text-[#8b949e] hover:text-white hover:bg-[#21262d] rounded-lg transition"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            title="Dashboard"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-[#21262d] text-white shadow-sm' : 'text-[#8b949e] hover:bg-[#21262d]/50 hover:text-white'}`}
          >
            <Activity className="w-4 h-4 text-[#58a6ff] shrink-0" />
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </button>

          <button 
            onClick={() => { setActiveTab('runners'); setStatusFilter('ALL'); }}
            title="All Runners"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'runners' ? 'bg-[#21262d] text-white shadow-sm' : 'text-[#8b949e] hover:bg-[#21262d]/50 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-[#3fb950] shrink-0" />
              {!isSidebarCollapsed && <span>All Runners</span>}
            </div>
            {!isSidebarCollapsed && <span className="bg-[#30363d] text-xs px-2 py-0.5 rounded-full text-white font-mono">{totalRunners}</span>}
          </button>

          <button 
            onClick={() => { setActiveTab('global-logs'); fetchGlobalLogs(); }}
            title="Global Logs"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'global-logs' ? 'bg-[#21262d] text-white shadow-sm' : 'text-[#8b949e] hover:bg-[#21262d]/50 hover:text-white'}`}
          >
            <FileText className="w-4 h-4 text-[#58a6ff] shrink-0" />
            {!isSidebarCollapsed && <span>Global Logs</span>}
          </button>

          <button 
            onClick={() => { setActiveTab('workflows'); fetchWorkflows(); }}
            title="Workflow History"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'workflows' ? 'bg-[#21262d] text-white shadow-sm' : 'text-[#8b949e] hover:bg-[#21262d]/50 hover:text-white'}`}
          >
            <Clock className="w-4 h-4 text-[#a371f7] shrink-0" />
            {!isSidebarCollapsed && <span>Workflow History</span>}
          </button>

          <button 
            onClick={() => setActiveTab('terminal')}
            title="Terminal"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'terminal' ? 'bg-[#21262d] text-white shadow-sm' : 'text-[#8b949e] hover:bg-[#21262d]/50 hover:text-white'}`}
          >
            <Terminal className="w-4 h-4 text-[#3fb950] shrink-0" />
            {!isSidebarCollapsed && <span>Terminal</span>}
          </button>

          <button 
            onClick={() => setActiveTab('files')}
            title="Files & Storage"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'files' ? 'bg-[#21262d] text-white shadow-sm' : 'text-[#8b949e] hover:bg-[#21262d]/50 hover:text-white'}`}
          >
            <Folder className="w-4 h-4 text-[#58a6ff] shrink-0" />
            {!isSidebarCollapsed && <span>Files & Storage</span>}
          </button>

          <button 
            onClick={() => setActiveTab('system')}
            title="System Hardware"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'system' ? 'bg-[#21262d] text-white shadow-sm' : 'text-[#8b949e] hover:bg-[#21262d]/50 hover:text-white'}`}
          >
            <Cpu className="w-4 h-4 text-[#d29922] shrink-0" />
            {!isSidebarCollapsed && <span>System Hardware</span>}
          </button>

          <button 
            onClick={() => { setActiveTab('settings'); fetchSettings(); }}
            title="Settings"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'settings' ? 'bg-[#21262d] text-white shadow-sm' : 'text-[#8b949e] hover:bg-[#21262d]/50 hover:text-white'}`}
          >
            <Settings className="w-4 h-4 text-[#a371f7] shrink-0" />
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>
        </nav>
      </div>

      {/* Left Sidebar Footer: About Docker & Version Status */}
      <div className="pt-3 border-t border-[#30363d] space-y-2">
        <button 
          onClick={() => setIsAboutModalOpen(true)}
          title="About Docker Container"
          className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-2 px-3'} py-2 rounded-lg text-xs font-medium text-[#8b949e] hover:text-white hover:bg-[#21262d] transition`}
        >
          <Info className="w-3.5 h-3.5 text-[#58a6ff] shrink-0" />
          {!isSidebarCollapsed && <span>About Docker Container</span>}
        </button>

        <div className={`py-1.5 bg-[#0d1117] rounded-lg border border-[#30363d] flex items-center overflow-hidden ${isSidebarCollapsed ? 'justify-center w-full px-1 text-center' : 'justify-between px-3'} text-[11px]`} title={`${versionInfo?.currentVersion || 'v3.0.0'} (Up to date)`}>
          {!isSidebarCollapsed && <span className="text-white font-semibold shrink-0">Version</span>}
          <span className={`text-[#3fb950] font-semibold font-mono truncate ${isSidebarCollapsed ? 'text-[9px] tracking-tighter text-center' : 'text-[11px] flex items-center gap-1'}`}>
            {!isSidebarCollapsed && <CheckCircle2 className="w-3 h-3 shrink-0" />} {versionInfo?.currentVersion || 'v3.0.0'}
          </span>
        </div>
      </div>
    </aside>
  );
}
