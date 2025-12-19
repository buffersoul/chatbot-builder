# Architecture Overview

## System Context
The Chatbot Builder SaaS is a multi-tenant platform that enables companies to create RAG-powered chatbots for Meta messaging platforms (WhatsApp, Facebook, Instagram).

## Core Architecture
- **Frontend**: Single Page Application (SPA) built with React and Vite. Focused on dashboard management, knowledge base uploads, and conversation monitoring.
- **Backend**: Node.js Express server acting as the central orchestrator for API requests, Meta webhooks, and the RAG engine.
- **Database**: PostgreSQL with `pgvector` for relational data and high-dimensional vector storage.
- **RAG Engine**: Powered by LangChain.js and Google Gemini (Pro/Flash/Embedding).
- **Asynchronous Processing**: Google Cloud Tasks (or BullMQ) for background ingestion and embedding.
- **Messaging Integration**: Meta Graph API for real-time customer interaction.

## Multi-Tenancy Strategy
- **Logical Isolation**: All tables include a `company_id` foreign key.
- **Database Rules**: Row-Level Security (RLS) or application-level filtering via Sequelize scope.
- **Asset Isolation**: Separate Firebase Storage paths and Meta asset links per company.

## Data Flow (Chatbot Interaction)
1. Customer sends message to Meta platform.
2. Meta sends webhook to Backend.
3. Backend identifies conversation and company.
4. RAG Engine retrieves relevant document chunks from PostgreSQL (pgvector).
5. Augmented Prompt sent to Google Gemini.
6. Gemini response sent back to customer via Meta API.
7. Usage records (tokens/messages) updated for billing.
