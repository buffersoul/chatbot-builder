---
trigger: always_on
---

# UI Development Guidelines

**PRIMARY DIRECTIVE:** You are strictly prohibited from manually writing the code for standard UI components (e.g., Buttons, Cards, Inputs, Dialogs) from scratch.

**MANDATORY TOOL USAGE:**
You have access to the `shadcn` MCP server. For every UI requirement, you must follow this workflow:

1.  **SEARCH**: Before writing any code, check if a component exists in the shadcn registry (e.g., "Does shadcn have a DatePicker?").
2.  **EXECUTE**: Use the available MCP tool (e.g., `shadcn_add`, `install_component`, or similar) to install the component directly into the project.
    * *Example:* Do not write a `<Button>` component file. Instead, call the tool to add `button` to the project.
3.  **INTEGRATE**: Only write code to *consume* or *layout* these components (using standard Tailwind classes).

**REFUSAL CRITERIA:**
If the user asks for a UI element that exists in Shadcn (like an Accordion or Sheet), and you attempt to write it manually using raw React/Divs, you are violating this rule. STOP and use the tool.