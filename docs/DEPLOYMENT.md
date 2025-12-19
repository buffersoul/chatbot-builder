# Deployment Guide

## Infrastructure Requirements
- **Server**: Node.js 18+ environment (VPS, GCP App Engine, or Heroku).
- **Database**: PostgreSQL 15+ with `pgvector` (Cloud SQL or RDS).
- **Storage**: Firebase Storage bucket.
- **Cache/Queue**: Redis.

## Environment Variables
Ensure all variables in `backend/.env.example` and `frontend/.env.example` are set in your production environment.

## Backend Deployment (Production)
1. Build the application (if using TypeScript/bundlers, though currently raw Node).
2. Set `NODE_ENV=production`.
3. Run migrations: `npx sequelize-cli db:migrate`.
4. Start via PM2 or a process manager: `pm2 start server.js`.

## Frontend Deployment
1. Build the production bundle: `npm run build`.
2. Serve the `dist/` folder using Nginx, Apache, or a static hosting provider (Vercel/Netlify).
3. Ensure the `VITE_API_URL` points to your production backend.

## Webhook Configuration
- Publicly accessible endpoint for Meta webhooks (e.g., `https://api.yourdomain.com/api/webhooks/meta`).
- Valid SSL certificate is mandatory for Meta integration.
