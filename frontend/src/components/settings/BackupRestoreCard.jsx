import React from 'react';
import { Download, Upload } from 'lucide-react';

export default function BackupRestoreCard({
  handleBackup,
  handleRestore,
  settings
}) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
      <div className="border-b border-[#30363d] pb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-[#58a6ff]" /> Backup &amp; Restore
        </h2>
        {settings.showHeadlines && (
          <p className="text-xs text-[#8b949e] mt-1">Export runner configurations and settings or restore from backup JSON.</p>
        )}
      </div>
      <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl space-y-3">
        <p className="text-xs text-[#8b949e]">Export all runner configs + settings to a JSON file, or restore from a previous backup.</p>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={handleBackup}
            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-[#1f6feb]/20 hover:bg-[#1f6feb]/40 text-[#58a6ff] border border-[#1f6feb]/40 rounded-lg transition font-semibold">
            <Download className="w-3.5 h-3.5" /> Backup Now
          </button>
          <label className="flex items-center gap-1.5 px-4 py-2 text-xs bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white border border-[#30363d] rounded-lg transition font-semibold cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Restore
            <input type="file" accept=".json" className="hidden" onChange={e => handleRestore(e.target.files[0])} />
          </label>
        </div>
      </div>
    </div>
  );
}
