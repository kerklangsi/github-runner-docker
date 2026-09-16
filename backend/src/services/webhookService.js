'use strict';
const https = require('https');
const http = require('http');

let webhookSettings = { url: '', events: [], enabled: false };

function updateSettings(settings) {
  webhookSettings = {
    url: settings.webhookUrl || '',
    events: settings.webhookEvents || [],
    enabled: !!(settings.webhookUrl && settings.webhookEnabled)
  };
}

function trigger(event, runner, message) {
  if (!webhookSettings.enabled) return;
  if (webhookSettings.events.length > 0 && !webhookSettings.events.includes(event)) return;
  const payload = JSON.stringify({
    event,
    runner: runner ? { id: runner.id, name: runner.name, status: runner.status } : null,
    message,
    timestamp: new Date().toISOString(),
    source: 'github-runner-manager'
  });
  sendPost(webhookSettings.url, payload);
}

function sendPost(urlStr, body) {
  try {
    const url = new URL(urlStr);
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => { res.resume(); });
    req.on('error', () => {});
    req.write(body);
    req.end();
  } catch (e) {}
}

async function test(url) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      event: 'test',
      message: 'GitHub Runner Manager webhook test',
      timestamp: new Date().toISOString(),
      source: 'github-runner-manager'
    });
    try {
      const u = new URL(url);
      const lib = u.protocol === 'https:' ? https : http;
      const req = lib.request({
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + u.search,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
      }, res => { resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode }); res.resume(); });
      req.on('error', e => resolve({ ok: false, error: e.message }));
      req.write(payload);
      req.end();
    } catch (e) {
      resolve({ ok: false, error: e.message });
    }
  });
}

module.exports = { updateSettings, trigger, test };
