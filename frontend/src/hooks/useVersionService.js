import { useState, useEffect } from 'react';

export function useVersionService(isAuthenticated) {
  const [versionInfo, setVersionInfo] = useState({
    currentVersion: 'v2.0.0',
    latestVersion: 'v2.0.0',
    updateAvailable: false,
    githubUrl: 'https://github.com/kerklangsi/github-runner-docker/releases/latest',
    githubRepoUrl: 'https://github.com/kerklangsi/github-runner-docker',
    dockerHubUrl: 'https://hub.docker.com/r/kerklangsi/github-runner-docker'
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/version/check')
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setVersionInfo(data);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  return { versionInfo, setVersionInfo };
}
