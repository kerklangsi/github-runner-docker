import React from 'react';
import { Settings } from 'lucide-react';

export default function LogLevelCard({
  settings,
  handleLogLevelChange
}) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-3">
      <div className="border-b border-[#30363d] pb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#a371f7]" /> Log Verbosity Level
        </h2>
        {settings.showHeadlines && (
          <p className="text-xs text-[#8b949e] mt-1">Adjust global logger verbosity threshold for system diagnostics.</p>
        )}
      </div>
      <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#a371f7]" />
          <h4 className="text-sm font-semibold text-white">Verbosity Level</h4>
        </div>
        <p className="text-xs text-[#8b949e]">Filter which log messages are shown</p>
        <select
          value={settings.logLevel || 'INFO'}
          onChange={e => handleLogLevelChange(e.target.value)}
          className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#58a6ff] mt-1"
        >
          <option value="ERROR">1. ERROR — Critical errors only</option>
          <option value="WARN">2. WARN — Warnings &amp; errors</option>
          <option value="INFO">3. INFO — Standard (Default)</option>
          <option value="DEBUG">4. DEBUG — Full diagnostics</option>
        </select>
      </div>
    </div>
  );
}
