import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PasswordSecurityCard({
  pwdForm,
  setPwdForm,
  handleChangePassword,
  settings
}) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
      <div className="border-b border-[#30363d] pb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#f0883e]" />
          Password Security
        </h2>
        {settings.showHeadlines && (
          <p className="text-xs text-[#8b949e] mt-1">Change administrator security credentials and update account access password.</p>
        )}
      </div>

      <form onSubmit={handleChangePassword} className="space-y-3.5 text-sm">
        <div>
          <label className="block text-xs font-medium text-[#8b949e] mb-1">Current Password</label>
          <input 
            type="password"
            required
            placeholder="Enter current password" 
            value={pwdForm.currentPassword} 
            onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58a6ff]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8b949e] mb-1">New Password</label>
          <input 
            type="password"
            required
            placeholder="Enter new password" 
            value={pwdForm.newPassword} 
            onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58a6ff]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8b949e] mb-1">Confirm New Password</label>
          <input 
            type="password"
            required
            placeholder="Confirm new password" 
            value={pwdForm.confirmPassword} 
            onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58a6ff]"
          />
        </div>

        <div className="pt-3 border-t border-[#30363d] flex justify-end">
          <button type="submit" className="bg-[#238636] hover:bg-[#2ea043] text-white font-semibold px-5 py-2 rounded-lg transition text-xs shadow-sm flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Update Password
          </button>
        </div>
      </form>
    </div>
  );
}
