import { useState, useRef, useEffect } from 'react';

export function useTerminalService() {
  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'output', text: 'GitHub Runner Manager Shell v2.0.0 (Ubuntu 22.04 LTS)\nType any command below or click a quick diagnostic button.' }
  ]);
  const [terminalCommand, setTerminalCommand] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const terminalConsoleRef = useRef(null);

  useEffect(() => {
    if (terminalConsoleRef.current) {
      terminalConsoleRef.current.scrollTop = terminalConsoleRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  function executeTerminalCommand(cmdToRun) {
    const cmd = (cmdToRun !== undefined ? cmdToRun : terminalCommand).trim();
    if (!cmd || isTerminalRunning) return;
    setTerminalOutput(prev => [
      ...prev,
      { type: 'input', text: cmd, timestamp: new Date().toLocaleTimeString() }
    ]);
    setTerminalHistory(prev => [...prev.filter(c => c !== cmd), cmd]);
    setHistoryIndex(-1);
    if (cmdToRun === undefined) setTerminalCommand('');
    setIsTerminalRunning(true);

    fetch('/api/terminal/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd })
    })
      .then(res => res.json())
      .then(data => {
        if (data.output) {
          setTerminalOutput(prev => [...prev, { type: 'output', text: data.output }]);
        } else if (data.error) {
          setTerminalOutput(prev => [...prev, { type: 'error', text: data.error }]);
        }
      })
      .catch(err => {
        setTerminalOutput(prev => [...prev, { type: 'error', text: `Execution failed: ${err.message}` }]);
      })
      .finally(() => setIsTerminalRunning(false));
  }

  return {
    terminalOutput, setTerminalOutput, terminalCommand, setTerminalCommand, terminalHistory,
    setTerminalHistory, historyIndex, setHistoryIndex, isTerminalRunning, terminalConsoleRef,
    executeTerminalCommand
  };
}
