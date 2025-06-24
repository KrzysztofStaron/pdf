# PDF Monorepo Project

A full-stack TypeScript monorepo for PDF processing and management, built with Next.js frontend and Express.js backend.

## 🚀 Tech Stack

## 📦 Installation

**Install all dependencies**

```bash
pnpm install:all
```

Or install manually:

```bash
pnpm install          # Root dependencies
cd frontend && pnpm install  # Frontend dependencies
cd ../backend && pnpm install  # Backend dependencies
```

## 🚀 Development

### Start both frontend and backend (Recommended)

```bash
pnpm dev
```

This runs both services concurrently:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001 (or configured port)

## 🏗️ Building for Production

### Build entire project

```bash
pnpm build
```

### Build services individually

**Frontend:**

```bash
pnpm build:frontend
# or
cd frontend && pnpm build
```

**Backend:**

```bash
pnpm build:backend
# or
cd backend && pnpm build
```

## 🚀 Production Deployment

### Frontend (Next.js)

After building, start the production server:

```bash
cd frontend && pnpm start
```

### Backend (Express.js)

After building, start the production server:

```bash
cd backend && pnpm start
```

## ☁️ Vercel Deployment

This project is configured for Vercel deployment with automatic builds:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Next.js frontend
3. The `vercel.json` configuration handles routing

## 📝 Available Scripts

### Root Level

- `pnpm dev` - Start both frontend and backend in development mode
- `pnpm build` - Build both frontend and backend for production
- `pnpm install:all` - Install dependencies for all packages

## 🔧 Development Tips

1. **Hot Reload**: Both frontend and backend support hot reloading during development
2. **Shared Types**: Add common interfaces to `shared/types/` for type safety across services
3. **Environment Variables**: Create `.env.local` files in frontend/backend directories for environment-specific settings
