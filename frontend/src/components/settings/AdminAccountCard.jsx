import React from 'react';
import { User, Save } from 'lucide-react';

export default function AdminAccountCard({
  avatarUrl,
  currentUsername,
  usernameInput,
  setUsernameInput,
  handleUpdateUsername,
  settings
}) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
      <div className="border-b border-[#30363d] pb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-[#58a6ff]" />
          Administrator Account
        </h2>
        {settings.showHeadlines && (
          <p className="text-xs text-[#8b949e] mt-1">Manage administrator authentication credentials and active session status.</p>
        )}
      </div>

      <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl space-y-3.5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} onError={(e) => { e.target.style.display = 'none'; }} className="w-12 h-12 rounded-full object-cover border-2 border-[#58a6ff] shadow-md" alt="Avatar" />
            ) : (
              <div className="p-3 bg-[#21262d] rounded-full">
                <User className="w-6 h-6 text-[#58a6ff]" />
              </div>
            )}
            <div>
              <h4 className="text-sm font-bold text-white">Administrator Account</h4>
              <span className="text-xs text-[#8b949e]">Username: <strong className="text-white font-mono">{currentUsername}</strong></span>
            </div>
          </div>
          <span className="bg-[#238636]/20 text-[#3fb950] text-xs px-2.5 py-1 rounded-full font-semibold border border-[#238636]/30">Active Session</span>
        </div>

        {/* Custom Username Edit Section */}
        <form onSubmit={handleUpdateUsername} className="pt-3 border-t border-[#30363d] flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-[#8b949e] mb-1">Custom Username</label>
            <input 
              type="text" 
              placeholder="Enter username"
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>
          <div className="self-end">
            <button 
              type="submit"
              className="whitespace-nowrap bg-[#238636] hover:bg-[#2ea043] text-white text-xs px-4 py-2 rounded-lg border border-[#238636] transition font-semibold shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
