---
trigger: always_on
---

# Stripe Integration Strategy (Hybrid)

**STRATEGY OVERVIEW:**
We use a strict separation of concerns between **Build-Time Configuration** (MCP) and **Runtime Execution** (SDK).

**1. ROLE OF STRIPE MCP (Dev/Setup Only):**
Use the Stripe MCP tool *exclusively* for:
* **Documentation:** If unsure about an API parameter, use the MCP to read Stripe documentation.
* **Initial Data Seeding:** Use the MCP to create necessary infrastructure *once* and retrieve their IDs.
    * *Example:* "Create a 'Pro Plan' product." -> Call MCP to create it -> Copy the resulting `price_id` into the project environment variables.
* **Account Checks:** Verifying webhooks or checking if a customer exists during debugging.

**2. ROLE OF STRIPE SDK (Runtime/App):**
You **MUST** use the official Stripe Node.js/Python SDK (`npm install stripe`) for all application logic.
* **Transactions:** Checkout Sessions, Payment Intents, and Subscription logic must be written in code.
* **Webhooks:** Write standard API route handlers to verify signatures and process events.

**PROHIBITED BEHAVIOR:**
* **Do not** use the MCP tool to simulate a user transaction (e.g., do not call `mcp.create_payment_link` to "test" the flow). Write a standard integration test using the SDK instead.
* **Do not** write code that attempts to create Products/Prices dynamically on every server start. These should be static resources set up via MCP.

**ENV VAR HANDLING:**
When the MCP returns an ID (e.g., `price_12345`), immediately instruct me to add it to `.env` (e.g., `STRIPE_PRICE_ID_PRO=price_12345`).