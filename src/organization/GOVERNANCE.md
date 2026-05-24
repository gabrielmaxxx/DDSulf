# DDSulf multi-tenant & Organizational SaaS Governance Standard

This governance specification guides the multi-tenant architecture, role policies, hierarchy privileges, and workspace structures of DDSulf.

---

## 1. Multi-Tenant Architectural Guidelines

1. **Isolation Mandate**: Under no circumstances can queries or data pipelines cross `TenantID` boundaries. Any operation that lacks an explicit `TenantID` filter is considered a critical security violation.
2. **Dynamic Context Engine**: The application relies on `useOrganizationalContext` to synchronize the active tenant, active workspace (such as branches), and RBAC clearances dynamically.
3. **Workspace Visual Boundaries**: Each tenant contains one or more independent workspaces. Workspaces isolate visual resources (schedules, checklists, stock, teams) representing regional operations.

---

## 2. RBAC (Role-Based Access Control) Policy Matrix

The platform guarantees strict roles segregation with unified authorization clearances:

| Role | Hierarchy Clearance | Primary Responsibility | Critical Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `100` | Full administrative, structural control | `manage:tenant-settings`, `write:margin-override`, `manage:users` |
| **Manager** | `80` | Local or regional office managers | `manage:users`, `manage:workspaces`, `write:financial` |
| **Commercial** | `50` | Sales staff & quote specialists | `read:financial`, `write:ops-schedule`, `use:ai-orchestrator` |
| **Operator** | `30` | Customer logistics & inventory | `manage:inventory`, `read:ops-schedule`, `write:ops-schedule` |
| **Technician** | `20` | Field execution specialists | `read:ops-schedule`, task checklist updates |

---

## 3. Financial Shielding Rules

- **Margin Guard**: Commercial operators cannot lower profit margins below the minimum defined in the tenant's `TenantGovernancePolicy` (fallback: 5%) without express approval and trigger of `write:margin-override`.
- **Auditing Logs**: Every cross-tenant access attempt, discount modification, or workspace setup registers a cryptographically clean audit trace.
