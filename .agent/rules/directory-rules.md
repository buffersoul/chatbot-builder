---
trigger: always_on
---

# Folder Structure Enforcement

You are working in a strictly separated monorepo. You must adhere to the following file placement rules for every task:

## 1. Frontend Rules
* **Path:** All frontend code must reside in the `frontend/` directory.
* **Scope:** This includes all React/Vue/UI components, CSS, and client-side logic.
* **Commands:** deeply verify you have `cd frontend` before running npm/yarn commands for the UI.

## 2. Backend Rules
* **Path:** All backend code must reside in the `backend/` directory.
* **Scope:** This includes API endpoints, database models, controllers, and server config.
* **Commands:** deeply verify you have `cd backend` before running server-side commands.

## 3. Root Protection
* **Prohibited:** NEVER create code files in the root directory (e.g., no random `.js` or `.py` files in root).
* **Allowed:** Only project-level config (like `.gitignore`, `README.md`) is allowed in root.

## 4. Ambiguity Resolution
* If a request implies code (e.g., "create a login page"), you MUST strictly infer the `frontend/` destination.
* If a request implies logic (e.g., "create a login API"), you MUST strictly infer the `backend/` destination.