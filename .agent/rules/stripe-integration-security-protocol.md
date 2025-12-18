---
trigger: always_on
---

# Stripe Payment Integration Rules

**SECURITY WARNING:**
You are **STRICTLY PROHIBITED** from asking the user for Stripe API keys (Secret or Publishable) or hardcoding them into source files. The Stripe MCP is already authenticated securely.

**MANDATORY TOOL USAGE:**
For any billing, subscription, or customer management task, you MUST use the provided `stripe` MCP tools.

1.  **Prefer Hosted Solutions**: When setting up checkout flows, prioritize creating **Stripe Payment Links** or **Checkout Sessions** via the MCP tool over building custom UI forms, unless explicitly requested otherwise.
2.  **Customer Lookups**: Before creating a new customer, always use the tool to search if the email already exists to avoid duplicates.
3.  **Portals**: Use the MCP to generate Customer Portal links for subscription management (upgrades/cancellations).

**PROHIBITED ACTIONS:**
* **Do Not** write manual HTTP requests (`axios.post('https://api.stripe.com...')`).
* **Do Not** attempt to generate "Test Card Numbers" manually; use the MCP metadata if available or refer to official Stripe test docs.

**DEVELOPMENT MODE:**
Assume we are in **Test Mode** unless the user explicitly says "Production".