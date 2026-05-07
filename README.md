# ◈ Prismboard

> A real-time analytics dashboard for tracking anything data-driven — built with Angular 17, NgRx, ECharts, and WebSockets. Currently configured as a job search tracker.

![Angular](https://img.shields.io/badge/Angular-17-red?logo=angular)
![NgRx](https://img.shields.io/badge/NgRx-State_Management-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)
![WebSockets](https://img.shields.io/badge/WebSockets-Real--time-green)

## Features

- **Real-time market feed** — live job market data streamed via WebSocket
- **Interactive charts** — pipeline funnel, weekly trends, and source breakdown (Apache ECharts)
- **Full CRUD job tracker** — add, edit, delete, and filter applications
- **NgRx state management** — actions, reducers, effects, and memoized selectors
- **Persistent storage** — data saved to localStorage via NgRx Effects
- **Lazy loaded routes** — optimized initial load time
- **Auto-reconnect WebSocket** — resilient real-time connection with retry logic

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17 (Standalone Components) |
| State | NgRx (Store, Effects, Entity, DevTools) |
| Charts | Apache ECharts via ngx-echarts |
| UI | Angular Material + Custom Design System |
| Backend | Node.js + Express |
| Real-time | WebSocket (ws library) |
| Language | TypeScript (strict mode) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Angular CLI: `npm install -g @angular/cli`

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/prismboard.git
cd prismboard

# Frontend dependencies
npm install

# Backend dependencies
cd server && npm install && cd ..
```

### Running Locally

```bash
# Terminal 1 — WebSocket + REST server
cd server && npm run dev

# Terminal 2 — Angular dev server
ng serve
```

Open [http://localhost:4200](http://localhost:4200)

### Chrome DevTools

Install the **Redux DevTools** extension to inspect every state change in real time.

## Project Structure

```
prismboard/
├── src/app/
│   ├── core/
│   │   ├── models/          # TypeScript interfaces and types
│   │   ├── services/        # WebSocket and Job services
│   │   └── store/           # NgRx: actions, reducers, selectors, effects
│   ├── features/
│   │   ├── dashboard/       # Analytics overview page
│   │   └── job-tracker/     # Job list and form
│   └── shared/              # Reusable components (stat-card, status-badge)
└── server/
    └── src/index.ts         # Express + WebSocket server
```

## Architecture Decisions

- **Feature-based folder structure** — each feature is self-contained and independently removable
- **NgRx Entity** — normalized store for O(1) lookups on job records
- **Memoized selectors** — derived data only recomputes when its inputs change
- **Effect-based persistence** — localStorage reads/writes happen outside the reducer, keeping state pure
- **Standalone components** — no NgModules, modern Angular best practice

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server uptime and connected client count |
| GET | `/api/market-stats` | Simulated job market statistics |
| WS | `ws://localhost:3000` | Real-time market pulse stream (5s interval) |

## License

MIT
