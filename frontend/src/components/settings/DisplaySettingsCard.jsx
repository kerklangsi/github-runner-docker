import React from 'react';
import { Sliders } from 'lucide-react';

export default function DisplaySettingsCard({
  settings,
  autoSaveSettings
}) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
      <div className="border-b border-[#30363d] pb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#58a6ff]" /> Display Settings
        </h2>
        {settings.showHeadlines && (
          <p className="text-xs text-[#8b949e] mt-1">Configure interface subtitles, log timestamps, and auto-scroll behavior.</p>
        )}
      </div>

      <div className="space-y-3 text-sm">
        {/* Headline Subtitles Toggle Switch */}
        <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">Headline Subtitles</h4>
            <span className="text-xs text-[#8b949e]">Show or hide descriptive subtitles under section headers</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.showHeadlines}
              onChange={e => autoSaveSettings({ ...settings, showHeadlines: e.target.checked }, e.target.checked ? 'Headline subtitles enabled' : 'Headline subtitles disabled')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#30363d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#238636]"></div>
          </label>
        </div>

        {/* Log Timestamps Toggle */}
        <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">Show Log Timestamps</h4>
            <span className="text-xs text-[#8b949e]">Show or hide timestamps in Global Logs and Runner Logs output</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.showTimestamps !== false}
              onChange={e => autoSaveSettings({ ...settings, showTimestamps: e.target.checked }, e.target.checked ? 'Log timestamps enabled' : 'Log timestamps disabled')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#30363d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#238636]"></div>
          </label>
        </div>

        {/* Auto-Scroll Logs Toggle */}
        <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">Auto-Scroll Logs</h4>
            <span className="text-xs text-[#8b949e]">Automatically scroll log panels to the latest entry</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.autoScrollLogs !== false}
              onChange={e => autoSaveSettings({ ...settings, autoScrollLogs: e.target.checked }, e.target.checked ? 'Log auto-scroll enabled' : 'Log auto-scroll disabled')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#30363d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#238636]"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
