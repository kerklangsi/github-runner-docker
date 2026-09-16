import React from 'react';
import { Info, Layers, CheckCircle2, ExternalLink, Github, Box, X } from 'lucide-react';

export default function AboutModal({
  isAboutModalOpen,
  setIsAboutModalOpen,
  system,
  versionInfo
}) {
  if (!isAboutModalOpen) return null;

  const currentVer = versionInfo?.currentVersion || 'v2.0.0';
  const latestVer = versionInfo?.latestVersion || currentVer;
  const isOutdated = versionInfo?.updateAvailable;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex justify-between items-start border-b border-[#30363d] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-xl text-[#58a6ff]">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">About GitHub Runner Manager</h3>
              <p className="text-xs text-[#8b949e]">Docker Environment & Version Info</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAboutModalOpen(false)}
            className="text-[#8b949e] hover:text-white p-1 rounded-lg hover:bg-[#21262d] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="bg-[#0d1117] border border-[#30363d] p-3.5 rounded-xl space-y-2 font-mono">
            <div className="flex justify-between border-b border-[#30363d]/60 pb-1.5 items-center">
              <span className="text-[#8b949e]">Installed Version:</span>
              <span className="text-[#3fb950] font-bold">{currentVer}</span>
            </div>
            <div className="flex justify-between border-b border-[#30363d]/60 pb-1.5 items-center">
              <span className="text-[#8b949e]">Latest Release:</span>
              <div className="flex items-center gap-1.5">
                <span className={isOutdated ? 'text-[#e3b341] font-bold' : 'text-[#3fb950] font-bold'}>{latestVer}</span>
                {isOutdated ? (
                  <span className="text-[10px] bg-[#d29922]/20 border border-[#d29922]/40 text-[#e3b341] px-1.5 py-0.5 rounded font-sans">
                    Update Available
                  </span>
                ) : (
                  <span className="text-[10px] bg-[#238636]/20 border border-[#238636]/40 text-[#3fb950] px-1.5 py-0.5 rounded font-sans">
                    Up to Date
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between border-b border-[#30363d]/60 pb-1.5">
              <span className="text-[#8b949e]">Base Container OS:</span>
              <span className="text-white">Ubuntu 22.04 LTS</span>
            </div>
            <div className="flex justify-between border-b border-[#30363d]/60 pb-1.5">
              <span className="text-[#8b949e]">Node.js Version:</span>
              <span className="text-[#58a6ff]">v20.18.0</span>
            </div>
            <div className="flex justify-between border-b border-[#30363d]/60 pb-1.5">
              <span className="text-[#8b949e]">Docker Runtime:</span>
              <span className="text-[#d29922]">Docker Engine v24+</span>
            </div>
            <div className="flex justify-between border-b border-[#30363d]/60 pb-1.5">
              <span className="text-[#8b949e]">Actions Runner Binary:</span>
              <span className="text-white">v2.321.0 (x64)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Active Container PIDs:</span>
              <span className="text-[#a371f7]">{system?.pids || 12} processes</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://github.com/kerklangsi/github-runner-docker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-white rounded-xl transition text-[11px] font-medium"
            >
              <Github className="w-3.5 h-3.5 text-[#58a6ff]" />
              <span>GitHub Repo</span>
              <ExternalLink className="w-3 h-3 text-[#8b949e]" />
            </a>

            <a
              href="https://hub.docker.com/r/kerklangsi/github-runner-docker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-white rounded-xl transition text-[11px] font-medium"
            >
              <Box className="w-3.5 h-3.5 text-[#388bfd]" />
              <span>Docker Hub Page</span>
              <ExternalLink className="w-3 h-3 text-[#8b949e]" />
            </a>
          </div>

          <div className="bg-[#1f6feb]/10 border border-[#1f6feb]/30 p-3 rounded-xl flex items-center gap-2.5 text-[#58a6ff]">
            <Layers className="w-4 h-4 shrink-0" />
            <span className="text-[11px] leading-tight">Isolated multi-tenant Docker cgroup container execution stack.</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button 
            onClick={() => setIsAboutModalOpen(false)}
            className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg transition text-xs font-semibold shadow-sm flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Close
          </button>
        </div>
      </div>
    </div>
  );
}
