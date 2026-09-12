import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Server, Play, Square, RefreshCw, Trash2, ExternalLink, 
  Terminal, Cpu, HardDrive, Shield, Settings, Plus, Search, Filter, 
  CheckCircle2, XCircle, AlertTriangle, Clock, Layers, FileText, ChevronRight
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [runners, setRunners] = useState([]);
  const [system, setSystem] = useState({ cpuUsage: 0, memUsage: 0, diskUsage: 0, uptimeSeconds: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedRunner, setSelectedRunner] = useState(null);
  const [runnerLogs, setRunnerLogs] = useState([]);
  const [logSearch, setLogSearch] = useState('');
  const [logLevel, setLogLevel] = useState('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const [toast, setToast] = useState(null);

  // Settings State
  const [settings, setSettings] = useState({
    targetUrl: '',
    accessToken: '',
    runnerToken: '',
    runnerNamePrefix: 'runner',
    runnerLabels: 'self-hosted,linux,x64',
    runnerGroup: 'Default',
    autoStartRunners: true
  });

  // Form state for Add Runner
  const [addForm, setAddForm] = useState({
    name: '',
    githubUrl: '',
    registrationToken: '',
    labels: 'self-hosted,linux,x64',
    runnerGroup: 'Default'
  });

  const logConsoleRef = useRef(null);

  function triggerToast(msg, type = 'info') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function fetchRunners() {
    fetch('/api/runners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRunners(data);
      });
  }

  function fetchSystem() {
    fetch('/api/system')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setSystem(data);
      });
  }

  function fetchSettings() {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setSettings(prev => ({ ...prev, ...data }));
        }
      });
  }

  useEffect(() => {
    fetchRunners();
    fetchSystem();
    fetchSettings();
    const interval = setInterval(() => {
      fetchRunners();
      fetchSystem();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll && logConsoleRef.current) {
      logConsoleRef.current.scrollTop = logConsoleRef.current.scrollHeight;
    }
  }, [runnerLogs, autoScroll]);

  function openAddModal() {
    fetchSettings();
    setAddForm({
      name: `runner-${Date.now().toString().slice(-4)}`,
      githubUrl: settings.targetUrl || '',
      registrationToken: settings.accessToken || settings.runnerToken || '',
      labels: settings.runnerLabels || 'self-hosted,linux,x64',
      runnerGroup: settings.runnerGroup || 'Default'
    });
    setIsAddModalOpen(true);
  }

  function handleSaveSettings(e) {
    e.preventDefault();
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
      .then(res => res.json())
      .then(data => {
        triggerToast('Global settings updated successfully!', 'success');
      });
  }

  // Runner controls
  function handleStart(id) {
    fetch(`/api/runners/${id}/start`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        triggerToast('Runner process starting...', 'success');
        fetchRunners();
      });
  }

  function handleStop(id) {
    fetch(`/api/runners/${id}/stop`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        triggerToast('Runner process stopping...', 'warning');
        fetchRunners();
      });
  }

  function handleRestart(id) {
    fetch(`/api/runners/${id}/restart`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        triggerToast('Restarting runner process...', 'info');
        fetchRunners();
      });
  }

  function handleRemove(id, name) {
    if (window.confirm(`Are you sure you want to remove runner '${name}'? This will unregister and stop the process.`)) {
      const deleteWork = window.confirm(`Do you also want to delete the _work directory for '${name}'?`);
      fetch(`/api/runners/${id}?removeWorkDir=${deleteWork}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
          triggerToast(`Runner '${name}' removed successfully.`, 'success');
          fetchRunners();
        });
    }
  }

  function handleAddSubmit(e) {
    e.preventDefault();
    if (!addForm.githubUrl || !addForm.registrationToken) {
      triggerToast('GitHub URL and Token are required.', 'error');
      return;
    }

    fetch('/api/runners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          triggerToast(`Failed to add runner: ${data.error}`, 'error');
        } else {
          triggerToast(`Runner '${data.name}' created and connecting to GitHub!`, 'success');
          setIsAddModalOpen(false);
          fetchRunners();
        }
      });
  }

  function openLogs(runner) {
    setSelectedRunner(runner);
    setIsLogModalOpen(true);
    fetch(`/api/runners/${runner.id}/logs?limit=200`)
      .then(res => res.json())
      .then(data => {
        if (data.lines) setRunnerLogs(data.lines);
      });
  }

  // Filtered runners
  const filteredRunners = runners.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.githubUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.labels.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'ONLINE') return matchesSearch && (r.status === 'ONLINE' || r.status === 'IDLE' || r.status === 'BUSY');
    if (statusFilter === 'OFFLINE') return matchesSearch && r.status === 'OFFLINE';
    if (statusFilter === 'FAILED') return matchesSearch && r.status === 'CRASHED';
    return matchesSearch;
  });

  const totalRunners = runners.length;
  const onlineCount = runners.filter(r => r.status === 'ONLINE' || r.status === 'IDLE' || r.status === 'BUSY').length;
  const offlineCount = runners.filter(r => r.status === 'OFFLINE').length;
  const busyCount = runners.filter(r => r.status === 'BUSY').length;
  const idleCount = runners.filter(r => r.status === 'IDLE').length;
  const crashedCount = runners.filter(r => r.status === 'CRASHED').length;

  return (
    <div className="flex h-screen bg-[#0d1117] text-[#c9d1d9] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#161b22] border-r border-[#30363d] flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-[#30363d]">
            <div className="p-2 bg-[#58a6ff]/10 rounded-lg text-[#58a6ff]">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-semibold text-white text-base">Runner Manager</h1>
              <span className="text-xs text-[#8b949e]">Single-Container Hub</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-[#21262d] text-white' : 'text-[#8b949e] hover:bg-[#21262d]/50 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-[#58a6ff]" />
                <span>Dashboard</span>
              </div>
              <span className="bg-[#30363d] text-xs px-2 py-0.5 rounded-full text-white">{totalRunners}</span>
            </button>

            <button 
              onClick={() => { setActiveTab('runners'); setStatusFilter('ALL'); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'runners' ? 'bg-[#21262d] text-white' : 'text-[#8b949e] hover:bg-[#21262d]/50 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-[#3fb950]" />
                <span>All Runners</span>
              </div>
            </button>

            <button 
              onClick={() => { setActiveTab('runners'); setStatusFilter('ONLINE'); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-[#8b949e] hover:bg-[#21262d]/50 hover:text-white pl-9"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3fb950]"></span>
                <span>Online</span>
              </div>
              <span className="text-xs text-[#8b949e]">{onlineCount}</span>
            </button>

            <button 
              onClick={() => { setActiveTab('runners'); setStatusFilter('OFFLINE'); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-[#8b949e] hover:bg-[#21262d]/50 hover:text-white pl-9"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8b949e]"></span>
                <span>Offline</span>
              </div>
              <span className="text-xs text-[#8b949e]">{offlineCount}</span>
            </button>

            <button 
              onClick={() => { setActiveTab('runners'); setStatusFilter('FAILED'); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-[#8b949e] hover:bg-[#21262d]/50 hover:text-white pl-9"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#f85149]"></span>
                <span>Crashed / Failed</span>
              </div>
              <span className="text-xs text-[#8b949e]">{crashedCount}</span>
            </button>

            <button 
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'system' ? 'bg-[#21262d] text-white' : 'text-[#8b949e] hover:bg-[#21262d]/50 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-[#d29922]" />
                <span>System Hardware</span>
              </div>
            </button>

            <button 
              onClick={() => { setActiveTab('settings'); fetchSettings(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'settings' ? 'bg-[#21262d] text-white' : 'text-[#8b949e] hover:bg-[#21262d]/50 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-[#a371f7]" />
                <span>Global Settings</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="border-t border-[#30363d] pt-4">
          <button 
            onClick={openAddModal}
            className="w-full flex items-center justify-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white font-medium py-2.5 px-4 rounded-lg transition shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Runner</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* System Resource Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">CPU Usage</span>
              <div className="text-2xl font-bold text-white mt-1">{system.cpuUsage}%</div>
            </div>
            <Cpu className="w-8 h-8 text-[#58a6ff]/40" />
          </div>

          <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">RAM Usage</span>
              <div className="text-2xl font-bold text-white mt-1">{system.memUsage}%</div>
              <span className="text-xs text-[#8b949e]">{system.memUsedMB || 0} MB / {system.memTotalMB || 0} MB</span>
            </div>
            <Activity className="w-8 h-8 text-[#3fb950]/40" />
          </div>

          <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">Disk Storage</span>
              <div className="text-2xl font-bold text-white mt-1">{system.diskUsage}%</div>
              <span className="text-xs text-[#8b949e]">{system.diskUsedGB || 0} GB / {system.diskTotalGB || 0} GB</span>
            </div>
            <HardDrive className="w-8 h-8 text-[#d29922]/40" />
          </div>

          <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">Container Uptime</span>
              <div className="text-xl font-bold text-white mt-1">{Math.floor(system.uptimeSeconds / 3600)}h {Math.floor((system.uptimeSeconds % 3600) / 60)}m</div>
            </div>
            <Clock className="w-8 h-8 text-[#a371f7]/40" />
          </div>
        </div>

        {activeTab === 'settings' ? (
          /* Global Settings Tab */
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-6 max-w-3xl">
            <div className="border-b border-[#30363d] pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#a371f7]" />
                Global Runner & Authentication Settings
              </h2>
              <p className="text-xs text-[#8b949e] mt-1">Configure default GitHub Repository URLs, Personal Access Tokens (PAT), Runner Labels, and Groups for all runners.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1">Target GitHub URL (TARGET_URL / REPO_URL)</label>
                <input 
                  type="text" 
                  placeholder="https://github.com/owner/repository or org" 
                  value={settings.targetUrl} 
                  onChange={e => setSettings({ ...settings, targetUrl: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1">Personal Access Token (ACCESS_TOKEN / GITHUB_PAT)</label>
                  <input 
                    type="password" 
                    placeholder="ghp_... or github_pat_..." 
                    value={settings.accessToken} 
                    onChange={e => setSettings({ ...settings, accessToken: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
                  />
                  <span className="text-[11px] text-[#8b949e]">Auto-exchanges PAT for GitHub registration tokens</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1">Runner Registration Token (RUNNER_TOKEN)</label>
                  <input 
                    type="password" 
                    placeholder="Temporary registration token" 
                    value={settings.runnerToken} 
                    onChange={e => setSettings({ ...settings, runnerToken: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
                  />
                  <span className="text-[11px] text-[#8b949e]">1-hour temporary token from GitHub Web UI</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1">Runner Name Prefix (RUNNER_NAME)</label>
                  <input 
                    type="text" 
                    placeholder="runner" 
                    value={settings.runnerNamePrefix} 
                    onChange={e => setSettings({ ...settings, runnerNamePrefix: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1">Runner Labels (RUNNER_LABELS)</label>
                  <input 
                    type="text" 
                    placeholder="self-hosted,linux,x64" 
                    value={settings.runnerLabels} 
                    onChange={e => setSettings({ ...settings, runnerLabels: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1">Runner Group (RUNNER_GROUP)</label>
                  <input 
                    type="text" 
                    placeholder="Default" 
                    value={settings.runnerGroup} 
                    onChange={e => setSettings({ ...settings, runnerGroup: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                  <input 
                    type="checkbox" 
                    checked={settings.autoStartRunners} 
                    onChange={e => setSettings({ ...settings, autoStartRunners: e.target.checked })} 
                    className="rounded border-[#30363d] bg-[#0d1117]"
                  />
                  <span>Auto-start runner processes when container launches</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#30363d] flex justify-end">
                <button 
                  type="submit" 
                  className="bg-[#238636] hover:bg-[#2ea043] text-white font-medium px-5 py-2 rounded-lg transition text-sm"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Dashboard & Runner Cards View */
          <>
            {/* Top Controls Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-[#8b949e]" />
                  <input 
                    type="text" 
                    placeholder="Search runners by name, URL, or labels..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>

                <select 
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#58a6ff]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ONLINE">Online / Idle</option>
                  <option value="OFFLINE">Offline</option>
                  <option value="FAILED">Crashed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8b949e]">Total: <strong className="text-white">{totalRunners}</strong></span>
                <span className="text-xs text-[#3fb950]">Online: <strong>{onlineCount}</strong></span>
                <span className="text-xs text-[#8b949e]">Offline: <strong>{offlineCount}</strong></span>
                {crashedCount > 0 && <span className="text-xs text-[#f85149]">Crashed: <strong>{crashedCount}</strong></span>}
              </div>
            </div>

            {/* Runners List / Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRunners.map(runner => (
                <div key={runner.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-[#58a6ff]/50 transition">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3 h-3 rounded-full ${runner.status === 'BUSY' ? 'bg-[#d29922] animate-pulse' : runner.status === 'ONLINE' || runner.status === 'IDLE' ? 'bg-[#3fb950]' : runner.status === 'CRASHED' ? 'bg-[#f85149]' : 'bg-[#8b949e]'}`}></span>
                        <h3 className="font-semibold text-white text-base">{runner.name}</h3>
                      </div>

                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${runner.status === 'BUSY' ? 'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/30' : runner.status === 'ONLINE' || runner.status === 'IDLE' ? 'bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]/30' : runner.status === 'CRASHED' ? 'bg-[#f85149]/10 text-[#f85149] border border-[#f85149]/30' : 'bg-[#30363d] text-[#8b949e]'}`}>
                        {runner.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#8b949e] truncate mb-3">{runner.githubUrl}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(runner.labels || 'self-hosted,linux,x64').split(',').map((label, idx) => (
                        <span key={idx} className="bg-[#21262d] text-[#58a6ff] text-xs px-2 py-0.5 rounded border border-[#30363d]">
                          {label.trim()}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-[#8b949e] space-y-1 bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
                      <div className="flex justify-between">
                        <span>Directory:</span>
                        <span className="font-mono text-[#c9d1d9]">{runner.dir}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Group:</span>
                        <span className="font-mono text-[#c9d1d9]">{runner.runnerGroup || 'Default'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Process PID:</span>
                        <span className="font-mono text-[#c9d1d9]">{runner.pid || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between border-t border-[#30363d] pt-3">
                    <div className="flex items-center gap-2">
                      {runner.status === 'OFFLINE' || runner.status === 'CRASHED' ? (
                        <button 
                          onClick={() => handleStart(runner.id)} 
                          className="flex items-center gap-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs px-3 py-1.5 rounded-lg font-medium transition"
                        >
                          <Play className="w-3.5 h-3.5" /> Start
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleStop(runner.id)} 
                          className="flex items-center gap-1.5 bg-[#da3633] hover:bg-[#b62324] text-white text-xs px-3 py-1.5 rounded-lg font-medium transition"
                        >
                          <Square className="w-3.5 h-3.5" /> Stop
                        </button>
                      )}

                      <button 
                        onClick={() => handleRestart(runner.id)} 
                        className="flex items-center gap-1.5 bg-[#21262d] hover:bg-[#30363d] text-white text-xs px-3 py-1.5 rounded-lg font-medium transition border border-[#30363d]"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#58a6ff]" /> Restart
                      </button>

                      <button 
                        onClick={() => openLogs(runner)} 
                        className="flex items-center gap-1.5 bg-[#21262d] hover:bg-[#30363d] text-white text-xs px-3 py-1.5 rounded-lg font-medium transition border border-[#30363d]"
                      >
                        <Terminal className="w-3.5 h-3.5 text-[#d29922]" /> Logs
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <a 
                        href={runner.githubUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 text-[#8b949e] hover:text-white transition rounded hover:bg-[#21262d]"
                        title="Open GitHub URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button 
                        onClick={() => handleRemove(runner.id, runner.name)} 
                        className="p-1.5 text-[#8b949e] hover:text-[#f85149] transition rounded hover:bg-[#21262d]"
                        title="Remove Runner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredRunners.length === 0 && (
                <div className="col-span-2 bg-[#161b22] border border-[#30363d] rounded-xl p-12 text-center">
                  <Server className="w-12 h-12 text-[#8b949e] mx-auto mb-3 opacity-40" />
                  <h3 className="text-white font-medium text-base">No GitHub Runners Found</h3>
                  <p className="text-xs text-[#8b949e] mt-1 mb-4">Add your first self-hosted runner to start executing GitHub Actions workflows.</p>
                  <button 
                    onClick={openAddModal}
                    className="bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                  >
                    + Add Runner Now
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Add Runner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#30363d] pb-3">
              <h3 className="text-white font-semibold text-base">Add New GitHub Runner</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#8b949e] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1">Runner Name</label>
                <input 
                  type="text" 
                  placeholder="runner-01" 
                  value={addForm.name} 
                  onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1">Target GitHub Repository or Organization URL *</label>
                <input 
                  type="text" 
                  required
                  placeholder="https://github.com/owner/repository or https://github.com/orgs/my-org" 
                  value={addForm.githubUrl} 
                  onChange={e => setAddForm({ ...addForm, githubUrl: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1">GitHub Token (Personal Access Token PAT or Registration Token) *</label>
                <input 
                  type="password" 
                  required
                  placeholder="ghp_... (PAT) or temporary registration token" 
                  value={addForm.registrationToken} 
                  onChange={e => setAddForm({ ...addForm, registrationToken: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
                />
                <span className="text-[11px] text-[#8b949e]">Accepts both PAT tokens (ghp_) and runner registration tokens</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1">Runner Labels (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="self-hosted,linux,x64" 
                    value={addForm.labels} 
                    onChange={e => setAddForm({ ...addForm, labels: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1">Runner Group</label>
                  <input 
                    type="text" 
                    placeholder="Default" 
                    value={addForm.runnerGroup} 
                    onChange={e => setAddForm({ ...addForm, runnerGroup: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#30363d]">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-[#21262d] text-[#8b949e] rounded-lg font-medium hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium">Install & Register Runner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Console Modal */}
      {isLogModalOpen && selectedRunner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-4xl p-6 flex flex-col gap-4 shadow-2xl h-[80vh]">
            <div className="flex justify-between items-center border-b border-[#30363d] pb-3">
              <div>
                <h3 className="text-white font-semibold text-base">Live Logs: {selectedRunner.name}</h3>
                <span className="text-xs text-[#8b949e]">{selectedRunner.dir}</span>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="text-[#8b949e] hover:text-white">✕</button>
            </div>

            <div className="flex items-center gap-3 bg-[#0d1117] p-2 rounded-lg border border-[#30363d]">
              <input 
                type="text" 
                placeholder="Search log output..." 
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                className="bg-transparent text-xs text-white px-2 py-1 focus:outline-none flex-1"
              />
              <label className="text-xs text-[#8b949e] flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} />
                Auto-scroll
              </label>
            </div>

            <div ref={logConsoleRef} className="flex-1 bg-[#011627] border border-[#30363d] rounded-lg p-4 font-mono text-xs text-[#d6deeb] overflow-y-auto whitespace-pre-wrap">
              {runnerLogs.filter(line => !logSearch || line.toLowerCase().includes(logSearch.toLowerCase())).join('\n') || 'No log entries found.'}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-4 py-3 rounded-lg text-sm font-medium shadow-xl border border-white/10 ${toast.type === 'success' ? 'bg-[#238636] text-white' : toast.type === 'error' ? 'bg-[#da3633] text-white' : 'bg-[#21262d] text-white'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
