const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const runnerService = require('./services/runnerService');
const systemService = require('./services/systemService');
const logService = require('./services/logService');
const db = require('./db/database');

const app = express();
app.use(cors());
app.use(express.json());

// API Routes

// 1. Get all runners
app.get('/api/runners', (req, res) => {
  const runners = runnerService.getAllRunners();
  res.json(runners);
});

// 2. Add a new runner
app.post('/api/runners', (req, res) => {
  const { name, githubUrl, registrationToken, token, accessToken, tokenType, labels, runnerGroup } = req.body;
  const tokenVal = registrationToken || token || accessToken;
  if (!githubUrl || !tokenVal) {
    return res.status(400).json({ error: 'GitHub URL and Token (Registration or Personal Access Token) are required.' });
  }

  const result = runnerService.createRunner({
    name: name || `runner-${Date.now().toString().slice(-4)}`,
    githubUrl,
    registrationToken: tokenVal,
    tokenType,
    labels,
    runnerGroup
  });

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  res.json(result.runner);
});

// 3. Get single runner details
app.get('/api/runners/:id', (req, res) => {
  const runner = runnerService.getRunnerById(req.params.id);
  if (!runner) {
    return res.status(404).json({ error: 'Runner not found' });
  }
  res.json(runner);
});

// 4. Runner controls: Start, Stop, Restart
app.post('/api/runners/:id/start', (req, res) => {
  const result = runnerService.startRunner(req.params.id);
  res.json(result);
});

app.post('/api/runners/:id/stop', (req, res) => {
  const result = runnerService.stopRunner(req.params.id);
  res.json(result);
});

app.post('/api/runners/:id/restart', (req, res) => {
  const result = runnerService.restartRunner(req.params.id);
  res.json(result);
});

// 5. Remove runner
app.delete('/api/runners/:id', (req, res) => {
  const removeWorkDir = req.query.removeWorkDir === 'true';
  const result = runnerService.removeRunner(req.params.id, removeWorkDir);
  res.json(result);
});

// 6. Get runner logs
app.get('/api/runners/:id/logs', (req, res) => {
  const search = req.query.search || '';
  const level = req.query.level || '';
  const limit = req.query.limit || 200;
  const result = logService.getRunnerLogs(req.params.id, { search, level, limit });
  res.json(result);
});

// 7. Live SSE Log Stream
app.get('/api/runners/:id/logs/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const runnerId = req.params.id;
  const interval = setInterval(() => {
    const logs = logService.getRunnerLogs(runnerId, { limit: 50 });
    res.write(`data: ${JSON.stringify(logs)}\n\n`);
  }, 2000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

// 8. System metrics
app.get('/api/system', (req, res) => {
  systemService.getSystemMetrics((err, metrics) => {
    res.json(metrics);
  });
});

// 9. Job history
app.get('/api/jobs', (req, res) => {
  const jobs = db.getJobs();
  res.json(jobs);
});

// 10. Settings
app.get('/api/settings', (req, res) => {
  const settings = db.getSettings();
  res.json(settings);
});

app.post('/api/settings', (req, res) => {
  db.saveSettings(req.body);
  res.json({ success: true, settings: req.body });
});

// Serve frontend static assets if built
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`GitHub Runner Manager Backend running on port ${PORT}`);
});
