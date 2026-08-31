# CaddyComfort

E-commerce fashion platform built with Next.js and Node.js.

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Beautiful UI components
- **Framer Motion** - Animations

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety

## Project Structure

```
caddycomfort/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/      # App router pages
│   │   ├── components/ # React components
│   │   └── lib/      # Utilities
│   └── package.json
├── backend/           # Express backend API
│   ├── src/
│   │   └── server.ts # Main server file
│   └── package.json
└── package.json       # Root package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install all dependencies (root, backend, and frontend)
npm run install:all
```

### Development

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run them separately:
npm run dev:frontend  # Runs on http://localhost:3000
npm run dev:backend   # Runs on http://localhost:5000
```

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup

The frontend is already configured with:

- Tailwind CSS v4
- shadcn/ui components
- Framer Motion for animations
- TypeScript support

## Deployment on Render

This monorepo is configured for deployment on Render.

### Build Commands

```bash
npm run build
```

### Start Command

```bash
npm start
```

The backend serves the built Next.js frontend in production.

## Available Scripts

- `npm run dev` - Run both frontend and backend in development
- `npm run build` - Build both frontend and backend
- `npm start` - Start production server
- `npm run install:all` - Install all dependencies

## Environment Variables

### Backend (.env)

```
PORT=5000
NODE_ENV=development
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api` - API info

---

Built with ❤️ for CaddyComfort
