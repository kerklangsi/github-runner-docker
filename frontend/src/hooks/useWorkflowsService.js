import { useState } from 'react';

export function useWorkflowsService() {
  const [workflowHistory, setWorkflowHistory] = useState([]);
  const [workflowLoading, setWorkflowLoading] = useState(false);

  function fetchWorkflows() {
    setWorkflowLoading(true);
    fetch('/api/workflows')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWorkflowHistory(data);
      })
      .finally(() => setWorkflowLoading(false));
  }

  return { workflowHistory, setWorkflowHistory, workflowLoading, fetchWorkflows };
}
