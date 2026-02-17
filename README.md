# HireVoice Test - Video Interview System

Monorepo containing a video interview application.

## Structure

- `client/` - React + Vite + TypeScript + Tailwind CSS v4
- `server/` - Node.js + Express + TypeScript

## Setup

```bash
npm install
cd client && npm install
cd ../server && npm install
cp server/.env.example server/.env
```

## Development

```bash
npm run dev
```

This starts both client (http://localhost:5173) and server (http://localhost:3001) concurrently.

## API Endpoints

- `GET /api/health` - Health check
