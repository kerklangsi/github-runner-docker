import React from 'react';
import { RefreshCw, Wifi } from 'lucide-react';

export default function AutomationAlertsCard({
  settings,
  setSettings,
  autoSaveSettings,
  handleWebhookTest
}) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
      <div className="border-b border-[#30363d] pb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-[#3fb950]" /> Automation &amp; Alerts
        </h2>
        {settings.showHeadlines && (
          <p className="text-xs text-[#8b949e] mt-1">Configure watchdog auto-recovery intervals and outbound webhook notifications.</p>
        )}
      </div>

      {/* ── Auto-Restart Watchdog ── */}
      <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#3fb950]" />
            <h4 className="text-sm font-semibold text-white">Auto-Restart Watchdog</h4>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={!!settings.watchdogEnabled}
              onChange={e => autoSaveSettings({ ...settings, watchdogEnabled: e.target.checked }, e.target.checked ? 'System Auto-Restart Watchdog enabled' : 'System Auto-Restart Watchdog disabled')}
              className="sr-only peer" />
            <div className="w-11 h-6 bg-[#30363d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#238636]"></div>
          </label>
        </div>
        <p className="text-xs text-[#8b949e]">Automatically restart runners that go OFFLINE or CRASHED (per-runner toggle on each card)</p>
        {settings.watchdogEnabled && (
          <div className="flex items-center gap-3 pt-1">
            <label className="text-xs text-[#8b949e] shrink-0">Check every</label>
            <input type="number" min={10} max={300} step={5}
              value={settings.watchdogIntervalSec || 30}
              onChange={e => autoSaveSettings({ ...settings, watchdogIntervalSec: parseInt(e.target.value) || 30 }, `Watchdog check interval set to ${e.target.value}s`)}
              className="w-20 bg-[#161b22] border border-[#30363d] rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-[#58a6ff]"
            />
            <label className="text-xs text-[#8b949e]">seconds</label>
          </div>
        )}
      </div>

      {/* ── Alerts & Webhook ── */}
      <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-[#d29922]" />
            <h4 className="text-sm font-semibold text-white">Alert Webhook</h4>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={!!settings.webhookEnabled}
              onChange={e => autoSaveSettings({ ...settings, webhookEnabled: e.target.checked }, e.target.checked ? 'Alert Webhook enabled' : 'Alert Webhook disabled')}
              className="sr-only peer" />
            <div className="w-11 h-6 bg-[#30363d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#238636]"></div>
          </label>
        </div>
        
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="https://your-webhook-url.example.com/notify"
              value={settings.webhookUrl || ''}
              onChange={e => setSettings({ ...settings, webhookUrl: e.target.value })}
              onBlur={() => autoSaveSettings(settings, 'Webhook URL saved!')}
              className="flex-1 min-w-0 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#58a6ff] font-mono"
            />
            <button type="button" onClick={() => { autoSaveSettings(settings); handleWebhookTest(settings.webhookUrl); }}
              className="px-4 py-2 text-xs bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] rounded-lg transition font-semibold shrink-0 flex items-center justify-center gap-1.5 shadow-sm">
              <Wifi className="w-3.5 h-3.5 text-[#58a6ff]" /> Test
            </button>
          </div>

          {/* Webhook Events: 1x4 Horizontal Row Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[
              { id: 'runner_crashed', label: 'Runner Crashed' },
              { id: 'runner_offline', label: 'Runner Offline' },
              { id: 'runner_started', label: 'Runner Started' },
              { id: 'watchdog_restart', label: 'Watchdog Restart' }
            ].map(ev => (
              <label key={ev.id} className="flex items-center gap-2 text-xs text-[#c9d1d9] bg-[#161b22] border border-[#30363d] px-2.5 py-2 rounded-lg cursor-pointer select-none hover:border-[#58a6ff]/50 transition truncate">
                <input type="checkbox"
                  checked={(settings.webhookEvents || []).includes(ev.id)}
                  onChange={e => {
                    const evts = settings.webhookEvents || [];
                    const updatedEvts = e.target.checked ? [...evts, ev.id] : evts.filter(x => x !== ev.id);
                    autoSaveSettings({ ...settings, webhookEvents: updatedEvts }, 'Webhook alert events updated!');
                  }}
                  className="accent-[#58a6ff] rounded shrink-0"
                />
                <span className="truncate">{ev.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
