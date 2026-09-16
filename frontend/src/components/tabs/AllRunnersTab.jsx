import React from 'react';
import { Plus } from 'lucide-react';
import RunnerCard from './RunnerCard';

export default function AllRunnersTab({
  runners,
  openAddModal,
  settings,
  editModeRunners,
  setEditModeRunners,
  runnerEdits,
  setRunnerEdits,
  showRunnerTokens,
  setShowRunnerTokens,
  unlockedRunnerTokens,
  setUnlockedRunnerTokens,
  handleUpdateRunnerInlineConfig,
  handleStart,
  handleStop,
  handleRestart,
  openLogs,
  handleExportRunnerConfig,
  openDeleteConfirmModal,
  fetchRunners,
  triggerToast
}) {
  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#161b22] border border-[#30363d] p-3.5 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white">All Runners — Configuration &amp; Management</h2>
          {settings.showHeadlines && (
            <p className="text-xs text-[#8b949e]">Click <strong>Edit Config</strong> on a runner card to modify its settings, then <strong>Apply</strong> to save.</p>
          )}
        </div>
      </div>

      {/* Check if no runners exist */}
      {runners.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div 
            onClick={openAddModal}
            className="bg-[#161b22]/60 hover:bg-[#161b22] border-2 border-dashed border-[#30363d] hover:border-[#58a6ff]/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition group min-h-[320px]"
          >
            <div className="p-4 bg-[#21262d] group-hover:bg-[#1f6feb]/20 border border-[#30363d] group-hover:border-[#58a6ff]/40 rounded-full text-[#8b949e] group-hover:text-[#58a6ff] transition mb-3">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-[#58a6ff] transition">Add Runner Container</h3>
            <p className="text-xs text-[#8b949e] mt-1 max-w-xs">No active runners registered. Click (+) to provision your first custom runner container instance.</p>
          </div>
        </div>
      ) : (
        /* All Runners Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {runners.map(runner => (
            <RunnerCard
              key={runner.id}
              runner={runner}
              settings={settings}
              editModeRunners={editModeRunners}
              setEditModeRunners={setEditModeRunners}
              runnerEdits={runnerEdits}
              setRunnerEdits={setRunnerEdits}
              showRunnerTokens={showRunnerTokens}
              setShowRunnerTokens={setShowRunnerTokens}
              unlockedRunnerTokens={unlockedRunnerTokens}
              setUnlockedRunnerTokens={setUnlockedRunnerTokens}
              handleUpdateRunnerInlineConfig={handleUpdateRunnerInlineConfig}
              handleStart={handleStart}
              handleStop={handleStop}
              handleRestart={handleRestart}
              openLogs={openLogs}
              handleExportRunnerConfig={handleExportRunnerConfig}
              openDeleteConfirmModal={openDeleteConfirmModal}
              fetchRunners={fetchRunners}
              triggerToast={triggerToast}
            />
          ))}

          {/* Add New Runner Container (+ Card) */}
          <div 
            onClick={openAddModal}
            className="bg-[#161b22]/60 hover:bg-[#161b22] border-2 border-dashed border-[#30363d] hover:border-[#58a6ff]/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition group min-h-[320px]"
          >
            <div className="p-4 bg-[#21262d] group-hover:bg-[#1f6feb]/20 border border-[#30363d] group-hover:border-[#58a6ff]/40 rounded-full text-[#8b949e] group-hover:text-[#58a6ff] transition mb-3">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-[#58a6ff] transition">Add Runner Container</h3>
            <p className="text-xs text-[#8b949e] mt-1 max-w-xs">Click (+) to provision a new runner container instance slot.</p>
          </div>
        </div>
      )}
    </div>
  );
}
