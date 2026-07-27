# PestFlow Operational AI, Safety & Contextual Governance

This document outlines the security rules, contextual limits, and prompt engineering strategies securing the PestFlow Operational Assistant.

---

## 1. Safety Pillars & Privilege Demarcation

The AI must respect the operational boundaries of the active user profile:

| User Profile | Confidentiality Scope | Action Items Allowed | Formatting Response Mode |
| :--- | :--- | :--- | :--- |
| **Admin / Finance** | Full access to raw financial figures | Pricing adjustments, base km-cost edits | Highly tactical business indicators |
| **Commercial** | Restricted from raw chemical buy costs | Upsell proposals, customer followups | Executive opportunities summaries |
| **Field Technician** | Hidden pricing and margins | Checklist steps, preventive pest tips | Heuristic mechanical operations |

## 2. In-Memory Context Injector

Dialogue inputs are enriched with structural parameters before submission:
1. **Financial Settings**: Base costs, hour rates, minimum margins.
2. **Current Performance**: Average margins, local sync latency.
3. **Draft States**: Stagnant proposal ages, active pest types.

---

## 3. Heuristic Offline Continuity

If internet connectivity is unavailable, the provider switches to a local contingency resolver:
- **Zero API Overload**: The local model generates prompt responses instantly from local caching state.
- **Role Verification**: Confirms profile permissions offline to ensure billing security remains safe.
