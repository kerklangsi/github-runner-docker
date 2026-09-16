import { useState, useRef, useEffect } from 'react';

export function useLogsService(showConfirm, triggerToast, logLevelRef, settings) {
  const [globalLogs, setGlobalLogs] = useState([]);
  const [globalLogSearch, setGlobalLogSearch] = useState('');
  const globalLogConsoleRef = useRef(null);

  useEffect(() => {
    if (settings.autoScrollLogs !== false && globalLogConsoleRef.current) {
      globalLogConsoleRef.current.scrollTop = globalLogConsoleRef.current.scrollHeight;
    }
  }, [globalLogs, settings.autoScrollLogs]);

  function fetchGlobalLogs(overrideLevel) {
    const lvl = overrideLevel || logLevelRef.current || settings.logLevel || 'INFO';
    fetch(`/api/logs/global?limit=300&level=${lvl}`)
      .then(res => res.json())
      .then(data => {
        if (data.lines) setGlobalLogs(data.lines);
      });
  }

  function handleClearGlobalLogs() {
    showConfirm(
      'Clear Global Logs',
      'This will permanently delete all global system logs. This action cannot be undone.',
      () => {
        fetch('/api/logs/global/clear', { method: 'POST' })
          .then(res => res.json())
          .then(() => { triggerToast('Global log buffer cleared!', 'success'); setGlobalLogs([]); })
          .catch(() => triggerToast('Failed to clear logs', 'error'));
      }
    );
  }

  return { globalLogs, setGlobalLogs, globalLogSearch, setGlobalLogSearch, globalLogConsoleRef, fetchGlobalLogs, handleClearGlobalLogs };
}
