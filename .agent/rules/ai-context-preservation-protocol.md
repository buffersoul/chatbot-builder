---
trigger: always_on
---

# AI Context Preservation Protocol

**OBJECTIVE:** Maintain a high-fidelity, persistent memory of the project's evolution to assist future agent sessions (and yourself) in understanding the "Story of the Code."

**MANDATORY FILES:**
You must create and maintain a directory named `.ai/` (or root level files) containing:
1.  `AI_CHANGELOG.md`: A chronological log of *technical* changes (not just commit messages, but architectural decisions).
2.  `CURRENT_STATUS.md`: A high-level snapshot of what works, what is broken, and the immediate next steps.

**WORKFLOW TRIGGER:**
**AFTER** every successful code modification or feature implementation, you must perform a **Context Update** step:

1.  **APPEND to `AI_CHANGELOG.md`**:
    * **Timestamp**: [Date/Time]
    * **Action**: Brief summary of files modified.
    * **Reasoning**: Why was this change made? (e.g., "Refactored auth hook to fix race condition").
    * **Context**: Any new dependencies or environment variables added?

2.  **UPDATE `CURRENT_STATUS.md`**:
    * Update the "Completed Features" list.
    * Update the "Known Issues" list.
    * **Crucial:** Update the "Next Immediate Goal" section so the next agent knows exactly where to pick up.

**PROHIBITION:**
Do not end a session or mark a task as "Done" without updating these files. They are your memory.