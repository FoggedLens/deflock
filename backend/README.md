# DeFlock Backend Service

A Node.js TypeScript service providing API endpoints for the DeFlock application.

## Features

- **GitHub Sponsors**: Fetch GitHub sponsors data
- **Geocoding**: Geocode addresses using Nominatim with LRU caching to avoid rate limits

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Add your GitHub token to `.env`:
```
GITHUB_TOKEN=your_github_token_here
PORT=8080
```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

## Production

Build and start the production server:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /api/healthcheck` - Returns service health status
- `HEAD /api/healthcheck` - Returns 200 OK

### GitHub Sponsors
- `GET /api/sponsors/github` - Fetches GitHub sponsors for the configured user

### Geocoding
- `GET /api/geocode?query=<address>` - Geocodes an address using Nominatim
  - Uses LRU cache (max 300 entries) to minimize API calls
  - Respects Nominatim rate limits

## Configuration

### Environment Variables
- `GITHUB_TOKEN` - GitHub personal access token with sponsorship read permissions
- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment mode (development/production)

### CORS
Allowed origins are configured in [server.ts](src/server.ts):
- http://localhost:8080
- http://localhost:5173
- https://deflock.me
- https://www.deflock.me

### Caching
The geocoding service uses an LRU cache with:
- Max 300 entries
- Automatic eviction of least recently used entries
- No TTL (cache persists until server restart)

## Project Structure

```
backend/
├── src/
│   ├── server.ts              # Main server file
│   └── services/
│       ├── github.ts          # GitHub API client
│       └── nominatim.ts       # Nominatim geocoding client with cache
├── package.json
├── tsconfig.json
└── .env.example
```
