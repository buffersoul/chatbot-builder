# Chatbot Builder SaaS

A multi-tenant RAG-powered chatbot SaaS platform that enables companies to automate customer conversations across Meta messaging platforms using their own knowledge base.

## Tech Stack
- **Frontend**: React (Vite), TailwindCSS, shadcn/ui, Zustand, React Query.
- **Backend**: Node.js (Express), PostgreSQL (pgvector), Sequelize, Redis.
- **AI/RAG**: LangChain.js, Google Gemini, Google text-embedding-004.
- **Messaging**: Meta Graph API (WhatsApp, Facebook, Instagram).
- **Billing**: Stripe.

## Project Structure
- `backend/`: Express server, Sequelize models, migrations, and RAG engine.
- `frontend/`: React SPA with TailwindCSS and shadcn/ui components.
- `docs/`: Technical documentation and API contracts.

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ with pgvector extension
- Redis
- Google Gemini API Key
- Stripe Account (Test mode)
- Meta Developer App (v18+)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd chatbot-builder
   ```

2. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   # Update variables in .env
   npm install
   npx sequelize-cli db:migrate
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   cp .env.example .env
   # Update variables in .env
   npm install
   npm run dev
   ```

## Documentation
- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Contracts](docs/API_CONTRACTS.md)
- [Knowledge Base Rules](docs/KNOWLEDGE_RULES.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
