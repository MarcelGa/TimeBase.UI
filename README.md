# TimeBase.UI

[![Build](https://github.com/MarcelGa/TimeBase.UI/actions/workflows/ci.yml/badge.svg)](https://github.com/MarcelGa/TimeBase.UI/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-purple)](https://vite.dev/)

Modern web interface for [TimeBase](https://github.com/MarcelGa/TimeBase) - the open-source financial time series data platform. Built with React 19, TypeScript, and TailwindCSS for a fast, responsive charting experience.

## Features

- **Real-time Charts**: Interactive candlestick charts powered by Lightweight Charts
- **Live Data Streaming**: SignalR WebSocket connection for real-time price updates
- **Multi-Provider Support**: Switch between different data providers seamlessly
- **Multiple Intervals**: Support for 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w, 1M timeframes
- **Dark Theme**: Modern dark UI optimized for financial data visualization
- **Responsive Design**: Works on desktop and tablet devices
- **State Persistence**: Remembers your symbol, interval, and provider preferences

## Screenshots

*Coming soon*

## Quick Start

### Prerequisites

- **Node.js 20+**: https://nodejs.org
- **npm** or **pnpm**
- **TimeBase Core**: Running on http://localhost:8080 (see [TimeBase](https://github.com/MarcelGa/TimeBase))

### 1. Clone the Repository

```bash
git clone https://github.com/MarcelGa/TimeBase.UI.git
cd TimeBase.UI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file (optional - defaults to localhost:8080):

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 4. Start Development Server

```bash
npm run dev
```

Open your browser to: http://localhost:5173

### 5. Build for Production

```bash
npm run build
npm run preview
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     TimeBase.UI (React)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages                                                │  │
│  │  - Dashboard (main charting view)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Components                                           │  │
│  │  - CandlestickChart (Lightweight Charts wrapper)      │  │
│  │  - ChartToolbar (interval, provider selection)        │  │
│  │  - ProviderSelector, SymbolSearch, PriceDisplay       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  State Management (Zustand)                           │  │
│  │  - chartStore (symbol, interval, provider, settings)  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Data Layer                                           │  │
│  │  - React Query for REST API calls                     │  │
│  │  - SignalR hooks for real-time streaming              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                    ↓ REST API / WebSocket
┌─────────────────────────────────────────────────────────────┐
│                  TimeBase Core (.NET 10)                     │
│                  http://localhost:8080                       │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
src/
├── api/                 # API client functions
│   └── data.ts          # Historical data, providers API
├── components/
│   ├── charts/          # Chart components
│   │   ├── CandlestickChart.tsx
│   │   ├── ChartToolbar.tsx
│   │   ├── PriceDisplay.tsx
│   │   ├── ProviderSelector.tsx
│   │   └── SymbolSearch.tsx
│   ├── layout/          # Layout components
│   │   └── MainLayout.tsx
│   └── ui/              # Reusable UI components (shadcn/ui style)
├── hooks/               # Custom React hooks
│   ├── useHistoricalData.ts
│   └── useSignalR.ts
├── pages/               # Page components
│   └── Dashboard.tsx
├── stores/              # Zustand stores
│   └── chartStore.ts
├── types/               # TypeScript type definitions
│   ├── api.ts
│   └── chart.ts
├── lib/                 # Utility functions
│   └── utils.ts
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── index.css            # Global styles (Tailwind)
```

## Technology Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 |
| **Language** | TypeScript 5.9 |
| **Build Tool** | Vite 7 |
| **Styling** | TailwindCSS 4 |
| **State Management** | Zustand 5 |
| **Data Fetching** | TanStack Query (React Query) 5 |
| **Real-time** | SignalR (@microsoft/signalr) |
| **Charts** | Lightweight Charts 5 |
| **UI Components** | Radix UI primitives |
| **Icons** | Lucide React |

## Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Type-check without emitting
npm run type-check

# Run ESLint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Integration

### REST API

The UI connects to TimeBase Core's REST API:

```typescript
// Get historical data
GET /api/data/{symbol}?interval=1d&start=2024-01-01&end=2024-12-31&providerId={id}

// List available providers
GET /api/providers

// Get providers for a symbol
GET /api/data/{symbol}/providers
```

### WebSocket (SignalR)

Real-time price updates via SignalR hub:

```typescript
// Connect to hub
const connection = new HubConnectionBuilder()
  .withUrl("http://localhost:8080/hubs/realtime")
  .build();

// Subscribe to symbol updates
await connection.invoke("Subscribe", "AAPL", "1m");

// Receive price updates
connection.on("PriceUpdate", (data) => {
  // Handle real-time OHLCV data
});
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | TimeBase Core API URL |

### Chart Store Persistence

The following settings are persisted to localStorage:
- Current symbol
- Selected interval
- Recent symbols history
- Volume visibility toggle
- Selected provider ID

## Development

### Prerequisites

- **Node.js 20+**: https://nodejs.org
- **VS Code** (recommended) with extensions:
  - ESLint
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (for .tsx files)

### Local Development Setup

1. **Ensure TimeBase Core is running**:
```bash
# In the TimeBase repository
cd src/docker
docker-compose -f docker-compose.dev.yml up --build
```

2. **Start the UI**:
```bash
cd TimeBase.UI
npm install
npm run dev
```

3. **Open** http://localhost:5173

### Code Quality

The project uses strict TypeScript and ESLint configuration:

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint
```

## Contributing

We welcome contributions! Please see the main [TimeBase CONTRIBUTING.md](https://github.com/MarcelGa/TimeBase/blob/main/CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Make** your changes
4. **Run** checks: `npm run type-check && npm run lint && npm run build`
5. **Submit** a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use functional components with hooks
- Keep components small and focused
- Use Zustand for global state, React Query for server state
- Write meaningful commit messages

## Roadmap

- [ ] **Settings Page**: User preferences, API configuration
- [ ] **Multiple Charts**: Side-by-side chart comparison
- [ ] **Drawing Tools**: Trend lines, fibonacci, annotations
- [ ] **Indicators**: Technical analysis overlays (MA, RSI, MACD)
- [ ] **Alerts**: Price alerts and notifications
- [ ] **Portfolio View**: Multi-symbol watchlist
- [ ] **Mobile Support**: Responsive mobile layout
- [ ] **Themes**: Light mode, custom themes

## License

TimeBase.UI is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Related Projects

- **[TimeBase](https://github.com/MarcelGa/TimeBase)**: Core API server and provider management
- **[TimeBase Provider SDK](https://github.com/MarcelGa/TimeBase/tree/main/src/TimeBase.ProviderSdk)**: Python SDK for building data providers

## Support

- **GitHub Issues**: https://github.com/MarcelGa/TimeBase.UI/issues
- **TimeBase Discussions**: https://github.com/MarcelGa/TimeBase/discussions

---

## Project Status

**Current Version**: 0.1.0 (Alpha)

TimeBase.UI is in active development. The core charting functionality is working, but additional features are planned. See the roadmap above for upcoming features.
