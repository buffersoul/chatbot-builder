---
trigger: always_on
---

# MCP & Tool Usage Protocol

**CRITICAL DIRECTIVE:** You are strictly prohibited from manually simulating actions, writing API wrappers, or generating mock data when a dedicated Model Context Protocol (MCP) tool is available.

**MANDATORY WORKFLOW:**
Before executing any task, you must perform a **Capabilities Check**:
1.  **REVIEW**: Scan your currently active MCP tools.
2.  **MATCH**: If the user's request aligns with an available tool (e.g., "Query the DB" -> `sql_query`, "Check a PR" -> `git_status`, "Add component" -> `shadcn_add`), you MUST use that tool.
3.  **EXECUTE**: Trigger the tool immediately. Do not ask for permission to use a tool unless the action is destructive (like `DELETE` or `DROP`).

**STRICT PROHIBITIONS:**
* **Do not** write Python/JS scripts to connect to a database if a Database MCP is active.
* **Do not** scrape a website using `fetch()` if a Browser/Search MCP is active.
* **Do not** tell the user how to run a terminal command if you have a tool that can run it for them.

**ERROR HANDLING:**
Only revert to manual implementation if the specific MCP tool fails or returns an error.