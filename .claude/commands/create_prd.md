# Command: Generate Product Requirements Document (PRD)

## Description
Based on the provided feature description, generate a comprehensive Product Requirements Document (PRD). The PRD must be well-structured, detailed, and follow industry best practices to serve as the single source of truth for this feature.

## Instructions
Generate a complete PRD for the following feature: "$ARGUMENTS".

The output must be a single, well-formatted Markdown document containing all the sections specified below. Be thorough and thoughtful in each section.

---

## Product Requirements Document: [Feature Name - You will name this based on the user's request]

**Version:** 1.0
**Date:** [Current Date]
**Author:** Claude

### 1. Overview & Problem Statement
* **1.1. Executive Summary:** Briefly describe the feature and its purpose. What is the core problem we are solving for the user?
* **1.2. User Pain Points:** Detail the specific issues, frustrations, or unmet needs the user currently experiences that this feature will address.
* **1.3. Strategic Alignment:** Explain how this feature aligns with our broader product goals and business objectives.

### 2. User Personas & Stories
* **2.1. Target User Personas:** Describe the primary and secondary user profiles who will benefit from this feature. (e.g., "Power User," "New User," "Administrator").
* **2.2. User Stories:** Write clear, concise user stories in the format: "As a [persona], I want to [action] so that I can [benefit]." Include multiple stories covering the primary use cases.

### 3. Functional & Non-Functional Requirements
* **3.1. Core Functional Requirements:** This is the most critical section. Create a detailed, numbered list of what the feature *must* do. Be specific and unambiguous.
    * Example: "3.1.1. The system shall allow users to save their conversation history with a single click."
    * Example: "3.1.2. The system shall list saved conversations in a sidebar, sorted chronologically with the newest on top."
* **3.2. Non-Functional Requirements (NFRs):** Define the standards the feature must meet.
    * **Performance:** How fast should it be? (e.g., "API responses must be under 200ms.")
    * **Security:** Are there specific security considerations? (e.g., "All data must be encrypted at rest and in transit.")
    * **Usability/Accessibility:** What are the key UI/UX principles or accessibility standards (WCAG 2.1 AA) to follow?
    * **Reliability:** What is the expected uptime or availability?

### 4. Scope & Future Iterations
* **4.1. In Scope:** Clearly list what is included in this version (MVP). This should align directly with the functional requirements.
* **4.2. Out of Scope (Future Iterations):** Explicitly state what is *not* being built in this version to manage expectations. List potential future enhancements (e.g., "V2 will include the ability to search conversation history.").

### 5. Technical Considerations
* **5.1. High-Level Technical Approach:** Suggest a possible technical implementation. Mention any potential impacts on existing systems (e.g., "This may require a new 'conversations' table in the database.").
* **5.2. Dependencies:** List any dependencies on other features, teams, or third-party services.

### 6. Success Metrics
* **6.1. Key Performance Indicators (KPIs):** Define the specific, measurable metrics that will determine if this feature is successful.
    * Example: "Increase in user engagement (daily active users) by 10%."
    * Example: "Feature adoption rate of 25% within the first month."