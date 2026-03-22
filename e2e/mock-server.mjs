import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sampleEventsPath = path.resolve(__dirname, '../sample-github-public-event.json');
const sampleEvents = JSON.parse(fs.readFileSync(sampleEventsPath, 'utf-8'));

// Contribution APIのモックレスポンス（365日分、決定的な固定データ）
// 実APIと同じく日付昇順（古い順）で返す
// fetchContribution内で .flat().reverse() されるため、reverse後:
//   [0]=今日(5), [1]=昨日(3), [2]=2日前(2), [3-6]=1, [7]=0, ...
// 期待値: Today=5, Yesterday=3, Streak=7, Coverage=85%
const generateContributions = () => {
  const contributions = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    let count;
    if (i === 0) count = 5;
    else if (i === 1) count = 3;
    else if (i === 2) count = 2;
    else if (i % 7 === 0) count = 0;
    else count = 1;
    contributions.push({
      date: date.toISOString().split('T')[0],
      contributionCount: count,
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
