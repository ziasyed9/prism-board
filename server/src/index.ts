import express     from 'express';
import http        from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors        from 'cors';

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocketServer({ server });

app.use(express.json());
app.use(cors({ origin: 'http://localhost:4200' }));

const PORT = process.env['PORT'] || 3000;

const clients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  console.log(`Client connected — total: ${clients.size + 1}`);
  clients.add(ws);

  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to Prismboard real-time server',
    timestamp: new Date().toISOString(),
  }));

  ws.on('message', (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString());
      console.log('Received from client:', msg);
    } catch {
      console.warn('Non-JSON message received');
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`Client disconnected — total: ${clients.size}`);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
    clients.delete(ws);
  });
});

function broadcast(data: object): void {
  const message = JSON.stringify(data);
  clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

const JOB_MARKET_SECTORS = [
  'Frontend',
  'Backend',
  'Full Stack',
  'DevOps',
  'Data Engineering',
  'ML/AI',
  'Mobile',
  'Security',
  'Product',
];

setInterval(() => {
  if (clients.size === 0) return;

  broadcast({
    type: 'market_pulse',
    timestamp: new Date().toISOString(),
    data: {
      sector: JOB_MARKET_SECTORS[Math.floor(Math.random() * JOB_MARKET_SECTORS.length)],
      newPostings: Math.floor(Math.random() * 250) + 50,
      avgSalaryK: Math.floor(Math.random() * 60) + 90,
      competitionRatio: parseFloat((Math.random() * 5 + 1).toFixed(1)),
    },
  });
}, 5000);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    clients: clients.size,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/market-stats', (_req, res) => {
  res.json({
    totalOpenRoles: Math.floor(Math.random() * 5000) + 45000,
    avgTimeToHire: Math.floor(Math.random() * 10) + 25,
    remotePercentage: Math.floor(Math.random() * 15) + 55,
    topSkills: ['TypeScript', 'React', 'Angular', 'Node.js', 'AWS', 'Python'],
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Prismboard server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready on ws://localhost:${PORT}`);
});
