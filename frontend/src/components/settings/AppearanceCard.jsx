import React from 'react';
import { Palette, Clock } from 'lucide-react';

export default function AppearanceCard({
  settings,
  currentTheme,
  setCurrentTheme,
  triggerToast,
  autoSaveSettings
}) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
      <div className="border-b border-[#30363d] pb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#a371f7]" /> Appearance &amp; Timezone
        </h2>
        {settings.showHeadlines && (
          <p className="text-xs text-[#8b949e] mt-1">Select theme color scheme and set local timezone for logs.</p>
        )}
      </div>

      {/* ── Theme Selector ── */}
      <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl space-y-2">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#a371f7]" />
          <h4 className="text-sm font-semibold text-white">Theme</h4>
        </div>
        <p className="text-xs text-[#8b949e]">Choose the UI color theme</p>
        <select
          value={currentTheme || 'dark'}
          onChange={e => {
            const val = e.target.value;
            setCurrentTheme(val);
            if (triggerToast) triggerToast(`Theme updated to '${val}'`, 'success');
          }}
          className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#58a6ff] mt-1"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="midnight">Midnight</option>
          <option value="forest">Forest</option>
        </select>
      </div>

      {/* ── Timezone ── */}
      <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-[#58a6ff]" />
          <h4 className="text-sm font-semibold text-white">Timezone</h4>
        </div>
        <p className="text-xs text-[#8b949e]">Affects log timestamp display</p>
        <select
          value={settings.timezone || 'Browser Default'}
          onChange={e => autoSaveSettings({ ...settings, timezone: e.target.value }, `Timezone set to '${e.target.value}'`)}
          className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#58a6ff] mt-1"
        >
        {['Browser Default','UTC','GMT','US/Eastern','US/Central','US/Mountain','US/Pacific',
          'Europe/London','Europe/Paris','Europe/Berlin','Europe/Moscow',
          'Asia/Tokyo','Asia/Shanghai','Asia/Singapore','Asia/Kolkata','Asia/Bangkok','Asia/Seoul',
          'Australia/Sydney','Pacific/Auckland','America/Sao_Paulo'].map(tz => (
          <option key={tz} value={tz}>{tz}</option>
        ))}
        </select>
      </div>
    </div>
  );
}
