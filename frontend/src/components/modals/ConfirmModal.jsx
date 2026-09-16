import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  confirmModal,
  setConfirmModal
}) {
  if (!confirmModal.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#d29922]/20 border border-[#d29922]/40 rounded-xl text-[#d29922]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">{confirmModal.title || 'Confirm Action'}</h3>
          </div>
          <button
            onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            className="text-[#8b949e] hover:text-white p-1 rounded-lg hover:bg-[#21262d] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#c9d1d9] leading-relaxed">
          {confirmModal.message}
        </p>

        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const cb = confirmModal.onConfirm;
              setConfirmModal({ ...confirmModal, isOpen: false });
              if (cb) cb();
            }}
            className="px-4 py-2 bg-[#da3633] hover:bg-[#b82a28] text-white rounded-lg transition text-xs font-semibold shadow-sm"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
