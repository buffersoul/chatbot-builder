# API Contracts

## Authentication
- `POST /api/auth/register`: Register a new company and owner.
- `POST /api/auth/login`: Authenticate user and return JWT + Refresh Token.
- `POST /api/auth/refresh`: Refresh expired access token.

## Company & Assets
- `GET /api/company/profile`: Get company details and subscription status.
- `GET /api/meta/connections`: List connected Meta assets.
- `POST /api/meta/verify-webhook`: Manually trigger webhook verification.

## Knowledge Base
- `GET /api/kb/documents`: List uploaded documents.
- `POST /api/kb/upload`: Upload PDF/Docx/Txt (Multipart).
- `DELETE /api/kb/documents/:id`: Remove document and its embeddings.

## Conversations
- `GET /api/conversations`: List all client conversations.
- `GET /api/conversations/:id/messages`: Get message history for a conversation.

## Billing & Usage
- `GET /api/billing/usage`: Get current period usage (tokens/messages).
- `GET /api/billing/invoices`: List past invoices.
- `POST /api/billing/create-checkout`: Create Stripe Checkout session for upgrade.
