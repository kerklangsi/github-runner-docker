import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export default function ToastNotification({ toast }) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl text-xs font-semibold animate-bounce">
      {toast.type === 'error' ? (
        <AlertTriangle className="w-4 h-4 text-[#f85149]" />
      ) : toast.type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 text-[#3fb950]" />
      ) : (
        <Info className="w-4 h-4 text-[#58a6ff]" />
      )}
      <span className="text-white">{toast.msg}</span>
    </div>
  );
}
