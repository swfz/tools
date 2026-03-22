import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sampleEventsPath = path.resolve(__dirname, '../sample-github-public-event.json');
const sampleEvents = JSON.parse(fs.readFileSync(sampleEventsPath, 'utf-8'));

// Contribution APIのモックレスポンス（365日分、一部0を含む）
const generateContributions = () => {
  const contributions = [];
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    contributions.push({
      date: date.toISOString().split('T')[0],
      contributionCount: i < 3 ? 5 : i % 7 === 0 ? 0 : Math.floor(Math.random() * 10) + 1,
    });
  }
  return [contributions];
};

const contributionResponse = {
  contributions: generateContributions(),
};

const server = http.createServer((req, res) => {
  const url = req.url || '';

  // Contribution API: /{username}.json?to=...
  if (url.match(/\/[\w-]+\.json/)) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(contributionResponse));
    return;
  }

  // GitHub Events API: /users/{username}/events
  if (url.match(/\/users\/[\w-]+\/events/)) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sampleEvents));
    return;
  }

  // ヘルスチェック用（PlaywrightのwebServerが起動確認に使う）
  if (url === '/' || url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

const PORT = 4444;
server.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
