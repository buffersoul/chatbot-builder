# AI Changelog

This file tracks all technical changes, architectural decisions, and context for future AI sessions.

---

## [2025-12-19 03:00 PKT] - Project Analysis & Planning

### Action
- Analyzed comprehensive `project_requirements.md` (4,649 lines)
- Created requirements analysis document
- Clarified tool usage rules with user

### Reasoning
- Need to understand full scope before implementation
- Ensure alignment with user rules and project requirements
- Establish clear critical path for development

### Context
**Project Type:** Multi-tenant RAG-powered chatbot SaaS platform

**Tech Stack:**
- Frontend: React 18+ with Vite, TailwindCSS, shadcn/ui
- Backend: Node.js 18+, Express.js, PostgreSQL with pgvector, Redis
- LLM: LangChain.js + Google Gemini
- Payments: Stripe with usage-based billing
- Messaging: Meta platforms (WhatsApp, Facebook, Instagram)

**Key Architectural Decisions:**
1. **Multi-tenancy:** company_id in every database query for strict isolation
2. **RAG Engine:** LangChain.js with Gemini for embeddings and LLM
3. **Async Processing:** Google Cloud Tasks for document ingestion and webhook processing
4. **Security:** AES-256-GCM encryption for Meta tokens and API secrets
5. **Billing:** Stripe SDK for runtime operations, MCP for setup/documentation

**Tool Usage Clarifications:**
- shadcn MCP: Documentation/availability checking only, install if available, otherwise create custom
- Nano Banana Pro: Only for missing static assets (not in icon libraries)
- Stripe MCP: Setup and documentation only, SDK for all runtime operations
- Folder structure: Strict backend/ and frontend/ separation

### Dependencies Added
None yet - project initialization phase

### Environment Variables Needed
Will be documented in `.env.example` during Phase 0 setup

---

## [2025-12-19 03:30 PKT] - Phase 0: Foundation & Documentation Setup

### Action
- Initialized backend and frontend project structures.
- Backend: Express server, Sequelize ORM setup, 14 migrations for multi-tenant schema.
- Frontend: Vite + React + TailwindCSS + shadcn/ui boilerplate.
- Docs: Created ARCHITECTURE.md, API_CONTRACTS.md, DEPLOYMENT.md, KNOWLEDGE_RULES.md.
- Tracking: Established task.md and CURRENT_STATUS.md.

### Reasoning
- Solid, documented foundation is critical for a complex multi-tenant RAG platform.
- Ensuring database schema follows requirements from day one prevents future refactoring.

### Context
- Project transitioned from planning to execution.
- All foundational directories and configuration files are in place.

### Dependencies Added
- Backend: express, sequelize, pg, langchain, jsonwebtoken, bcrypt, stripe, firebase-admin, etc.
- Frontend: react, tailwindcss, shadcn/ui base, react-query, zustand, framer-motion, etc.

---

## [2025-12-19 04:15 PKT] - Phase 1: Authentication & Multi-Tenancy Complete

### Action
- Implemented JWT-based authentication service.
- Created Company and User models with Sequelize associations.
- Built Login and Registration UI with shadcn/ui.
- Configured protected routing in frontend.
- Added docker-compose.yml for local dev stack (Postgres + Redis).

### Reasoning
- Secure auth is prerequisite for any multi-tenant operations.
- Dockerizing the stack ensures consistent dev environment.

### Context
- Moving to Phase 2: Knowledge Base Management.
- Need to handle file uploads next.

---

## [2025-12-19 04:45 PKT] - Phase 2: Knowledge Base Management Complete

### Action
- Implemented `Document` and `Embedding` Sequelize models with pgvector support.
- Created `firebaseService.js` for file storage.
- Created `ingestionService.js` for parsing (pdf-parse, mammoth) and embedding (Google Gemini).
- Built Frontend `KnowledgeBasePage` with upload UI.
- Integrated `DashboardLayout`.
- Ran database migrations for vector support.

### Reasoning
- In-process ingestion chosen for MVP simplicity over separate worker service (Cloud Tasks), to be scaled later.
- Multer memory storage used to stream directly to Firebase/GEMINI.

### Context
- Moving to Phase 3: RAG Chatbot Engine.
- Need to implement the actual retrieval and chat logic next.

---

## [2025-12-19 05:00 PKT] - Phase 3: RAG Chatbot Engine Complete

### Action
- Implemented `retrievalService.js` for cosine similarity search.
- Implemented `ragService.js` connecting Retrieval + Gemini Pro.
- Created `Message` model and `conversationService.js` for history.
- Built `ChatPage.jsx` and integrated it into the dashboard.

### Reasoning
- Used `text-embedding-004` and `gemini-1.5-pro` for best performance/cost ratio.
- Created a dedicated "Experience Chat" page for easy testing.

### Context
- The Core MVP is now functional! Users can upload docs and chat with them.

---

## Next Steps
1. User Verification of RAG flow.
2. Phase 4: Chat Widget (Embeddable Script).

---

## [2025-12-19 12:20 PKT] - Phase 4: Meta Platform Integration Complete

### Action
- **Backend:** Implemented `MetaService` for OAuth and API interactions, `MessageDispatcher` for webhook handling, and `metaRoutes`. Updated `MetaAsset` model.
- **Frontend:** Created `IntegrationsPage` for managing Facebook connections.
- **Verification:** Created `scripts/test_meta_webhook.js` to verify end-to-end flow.

### Reasoning
- Integrating with Meta allows the chatbot to operate on major social messaging channels (Facebook, WhatsApp, Instagram).
- `MetaAsset` table ensures secure and organized storage of platform-specific credentials.
- Webhook dispatcher pattern allows scalable handling of incoming messages from multiple sources.

### Context
- Meta integration is code-complete. Use `IntegrationsPage` to connect Pages.
- **Next Steps:** User to add Meta credentials to `.env` and verify via UI. Then proceed to Phase 6 (Stripe Billing) or Phase 5 (External APIs).

---

## [2025-12-19 12:40 PKT] - Optimization: RAG Retrieval Limit Increased

### Action
- Increased `topK` retrieval limit from **5** to **30** chunks in `retrievalService.js` and `ragService.js`.

### Reasoning
- User reported that relevant information in large documents (beyond the top 5 chunks) was not being retrieved, leading to "I don't know" answers.
- Gemini's large context window allows for significantly more context. Increasing the limit to 30 (~6-8k tokens) dramatically improves recall without hitting limits.

### Context
- This should solve the issue for large uploaded files where semantic similarity might spread relevant info across many chunks.

---

## [2025-12-19 13:45 PKT] - Phase 6: Stripe Billing Backend Complete

### Action
- **Backend**: Installed `stripe`. Created `PricingTier`, `UsageRecord`, `BillingInvoice` models.
- **Services**: Implemented `stripeService.js` (Subscriptions, Webhooks) and `usageService.js`.
- **Routes**: Created `billingRoutes.js`.
- **Data**: Seeded Default Pricing Tiers (Free, Starter, Pro).

### Reasoning
- Essential for SaaS monetization.
- Usage tracking requires strict daily records to prevent abuse and calculate costs.
- Webhooks are critical for async subscription status updates (payment success/fail).

### Context
- Backend is ready for Billing UI implementation.
- **Next Steps**: User to provide Stripe keys. Proceed to Phase 7 (Frontend Billing UI).

---

## [2025-12-19 14:00 PKT] - Phase 7: Frontend Billing UI Complete

### Action
- **Frontend**: Created `BillingPage.jsx` with Tabs (Overview, Plans, Invoices).
- **Components**: Added `Tabs` shadcn component. Fixed sidebar imports.
- **Routing**: Added `/billing` route and nav item.
- **Integration**: Mapped new API endpoints to UI.

### Reasoning
- Provides self-serve subscription management for users.
- Transparency in usage tracking (progress bars).
- Seamless upgrade flow using Stripe Checkout.

### Context
- Full billing stack (Backend + Frontend) is now implemented.
- **Next Steps**: End-to-End testing and Quality Assurance (Phase 8).

---

## [2025-12-20 00:30 PKT] - Team Management & RBAC Enhancements

### Action
- **Backend:** Created `Invitation` model and `teamController.js`.
- **Frontend:** Created `TeamSettings.jsx` and `AcceptInvitePage.jsx`.
- **Security:** Granular RBAC (Owner/Admin/Agent).

### Reasoning
- Essential for multi-user collaboration.

---

## [2025-12-22 14:55 PKT] - UI and API Bug Fixes

### Action
- **UI:** Refactored `Button` component to use `React.forwardRef`.
- **API Integration:** Fixed `createInvitation` in `api.js` to accept a single object argument to match frontend usage, preventing backend errors.
- **Database:** Re-ran migrations for `invitations` table.

### Reasoning
- Fixed mismatches between frontend calls and backend expectations.
