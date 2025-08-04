# Command: Log Completed Task in PRD

## Description
This command is intended to be run immediately after a development task has been completed. It automates the process of updating the relevant Product Requirements Document (PRD) to reflect the work that was just finished. Its goal is to keep documentation synchronized with the actual state of the codebase.

## Instructions
Based on the task that was just completed, you are to update the corresponding PRD. The completed task is: "$ARGUMENTS"

Execute the following steps precisely:

1.  **Identify the Completed Task:** Analyze the description of the work you just performed: "$ARGUMENTS".

2.  **Locate the Relevant PRD:** Find the PRD file in the codebase that corresponds to the feature you were working on.

3.  **Find and Update Requirements:**
    * Scan the "Functional Requirements" section of the PRD.
    * Identify the specific, numbered requirement(s) that have been fulfilled by the completed task.
    * Mark each of these requirements as complete by prepending the line with `[DONE]`.
    * **Example:**
        * **Before:** `3.1.1. The system shall allow users to save their conversation history with a single click.`
        * **After:** `[DONE] 3.1.1. The system shall allow users to save their conversation history with a single click.`

4.  **Add Implementation Notes:**
    * Immediately below each requirement you marked as `[DONE]`, add a sub-bullet point titled `Implementation Note:`.
    * In this note, briefly describe how the requirement was implemented and reference the specific file(s) you created or modified.
    * **Example:**
        * `[DONE] 3.1.2. The system shall list saved conversations in a sidebar...`
        * `  * Implementation Note: Added a new React component `ConversationSidebar.tsx` and updated the `api/conversations.ts` endpoint to fetch the list.`

5.  **Update the Change Log:**
    * Navigate to the "Change Log" section at the top of the PRD.
    * Increment the minor version number (e.g., from 1.0 to 1.1, or 1.1 to 1.2).
    * Add a new entry to the top of the log with the new version, the current date, and a summary of what was accomplished. The summary should clearly state which requirements were marked as complete.
    * **Example:** `* **Version 1.1 | [Current Date]:** Marked requirements 3.1.1 and 3.1.2 as [DONE]. Implemented core logic for saving and listing conversations.`

6.  **Output the Final Document:**
    * After making all the changes, output the entire, complete, and updated content of the PRD file.

This systematic process ensures our documentation is always a reliable and up-to-date reflection of our progress.