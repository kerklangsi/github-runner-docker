import React from 'react';
import { Github, Lock, User, ShieldCheck } from 'lucide-react';

export default function LoginView({
  loginForm,
  setLoginForm,
  loginError,
  handleLogin
}) {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 max-w-md w-full space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-[#1f6feb]/10 rounded-2xl border border-[#1f6feb]/30 mb-2">
            <Github className="w-8 h-8 text-[#58a6ff]" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">GitHub Runner Manager</h2>
          <p className="text-xs text-[#8b949e]">Sign in to access your runner dashboard</p>
        </div>

        {loginError && (
          <div className="bg-[#da3633]/20 border border-[#da3633]/50 text-[#f85149] px-4 py-3 rounded-xl text-xs font-semibold text-center">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={loginForm.username}
                onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                placeholder="Admin username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
