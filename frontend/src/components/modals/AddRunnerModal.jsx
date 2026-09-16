import React from 'react';
import { Plus, X, Upload, Eye, EyeOff, Save } from 'lucide-react';

export default function AddRunnerModal({
  isAddModalOpen,
  setIsAddModalOpen,
  addForm,
  setAddForm,
  showAddToken,
  setShowAddToken,
  handleConfigFileUpload,
  handleAddRunner
}) {
  if (!isAddModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
        <div className="flex justify-between items-center border-b border-[#30363d] pb-4">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#3fb950]" />
            <h3 className="text-lg font-bold text-white">Add Runner Container Slot</h3>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(false)}
            className="text-[#8b949e] hover:text-white p-1 rounded-lg hover:bg-[#21262d] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Import Config File Button */}
        <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded-xl flex items-center justify-between">
          <div className="text-xs">
            <span className="font-semibold text-white">Import Existing Config</span>
            <p className="text-[#8b949e] text-[11px]">Upload JSON or .env file to auto-fill</p>
          </div>
          <label className="cursor-pointer bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#30363d] flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" /> Select File
            <input type="file" accept=".json,.env,.txt" onChange={handleConfigFileUpload} className="hidden" />
          </label>
        </div>

        <form onSubmit={handleAddRunner} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#8b949e] font-medium mb-1">Runner Instance Name (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. runner-prod-01 (auto-generated if empty)"
              value={addForm.name} 
              onChange={e => setAddForm({ ...addForm, name: e.target.value })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          <div>
            <label className="block text-[#8b949e] font-medium mb-1">Target Repository or Org URL *</label>
            <input 
              type="text" 
              required
              placeholder="https://github.com/your-org/your-repo"
              value={addForm.githubUrl} 
              onChange={e => setAddForm({ ...addForm, githubUrl: e.target.value })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          <div>
            <label className="block text-[#8b949e] font-medium mb-1">GitHub PAT or Registration Token *</label>
            <div className="relative">
              <input 
                type={showAddToken ? 'text' : 'password'} 
                required
                placeholder="ghp_... or registration token"
                value={addForm.registrationToken} 
                onChange={e => setAddForm({ ...addForm, registrationToken: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-3 pr-10 py-2 text-white font-mono focus:outline-none focus:border-[#58a6ff]"
              />
              <button 
                type="button"
                onClick={() => setShowAddToken(!showAddToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-white"
                title={showAddToken ? 'Hide Token' : 'Show Token'}
              >
                {showAddToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8b949e] font-medium mb-1">Labels (comma-separated)</label>
              <input 
                type="text" 
                value={addForm.labels} 
                onChange={e => setAddForm({ ...addForm, labels: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#58a6ff]"
              />
            </div>

            <div>
              <label className="block text-[#8b949e] font-medium mb-1">Runner Group</label>
              <input 
                type="text" 
                value={addForm.runnerGroup} 
                onChange={e => setAddForm({ ...addForm, runnerGroup: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#30363d] flex justify-end gap-2">
            <button 
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg transition font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" /> Provision Runner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
