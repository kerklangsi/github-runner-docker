import { useState, useEffect } from 'react';

export function useAuthService(triggerToast) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('runner_mgr_auth') === 'true';
  });
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: '' });
  const [loginError, setLoginError] = useState('');

  // Theme & Profile Avatar State
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('app_theme') || 'dark');
  const [avatarUrl, setAvatarUrl] = useState('/api/user/avatar.png');
  const [avatarInputUrl, setAvatarInputUrl] = useState('');
  const [currentUsername, setCurrentUsername] = useState('admin');
  const [usernameInput, setUsernameInput] = useState('admin');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('app_theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data && data.avatarUrl) setAvatarUrl(data.avatarUrl);
          if (data && data.username) {
            setCurrentUsername(data.username);
            setUsernameInput(data.username);
          }
        });
    }
  }, [isAuthenticated]);

  function handleLogin(e) {
    e.preventDefault();
    setLoginError('');

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsAuthenticated(true);
          localStorage.setItem('runner_mgr_auth', 'true');
          triggerToast('Welcome back, admin!', 'success');
        } else {
          setLoginError(data.error || 'Invalid credentials');
        }
      });
  }

  function handleLogout() {
    setIsAuthenticated(false);
    localStorage.removeItem('runner_mgr_auth');
    triggerToast('Logged out successfully', 'info');
  }

  function handleUpdateUsername(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!usernameInput || !usernameInput.trim()) {
      triggerToast('Username cannot be empty', 'error');
      return;
    }
    const newName = usernameInput.trim();
    fetch('/api/auth/change-username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newUsername: newName })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          triggerToast(data.error, 'error');
        } else {
          setCurrentUsername(data.username || newName);
          triggerToast(`Administrator username updated to '${data.username || newName}'!`, 'success');
        }
      })
      .catch(() => triggerToast('Failed to update username', 'error'));
  }

  function handleSaveAvatarUrl() {
    if (!avatarInputUrl.trim()) return;
    fetch('/api/user/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarUrl: avatarInputUrl.trim() })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAvatarUrl(data.avatarUrl);
          setAvatarInputUrl('');
          triggerToast('Avatar picture updated!', 'success');
        }
      });
  }

  function handleAvatarFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAvatarUrl(data.avatarUrl);
            triggerToast('Profile picture uploaded to Docker storage!', 'success');
          }
        });
    };
    reader.readAsDataURL(file);
  }

  return {
    isAuthenticated, setIsAuthenticated, loginForm, setLoginForm, loginError, handleLogin, handleLogout,
    currentTheme, setCurrentTheme, avatarUrl, avatarInputUrl, setAvatarInputUrl, currentUsername, usernameInput,
    setUsernameInput, handleUpdateUsername, handleSaveAvatarUrl, handleAvatarFileUpload
  };
}
