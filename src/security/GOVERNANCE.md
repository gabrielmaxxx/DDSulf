# DDSulf Security, RBAC & Operational Governance Specifications

This document defines the server rules, client guards, and role-based access control (RBAC) structures securing DDSulf.

---

## 1. Enterprise Role Matrix

The platform models 7 specific operational user profiles:

| Role Name | Key | Hierarchy Value | Guarded Modules | Field Level Restrictions |
| :--- | :--- | :---: | :--- | :--- |
| **Super Admin** | `super_admin` | `100` | All Modules | *None (Full Overrides)* |
| **Admin** | `admin` | `80` | All Modules | *None* |
| **Financeiro** | `financeiro` | `60` | Financial, Dashboard, Calculator, Clients, Quotes | *None (Can edit base costs)* |
| **Gestor Operacional** | `gestor_operacional` | `50` | Dashboard, Inventory, POPs, Clients, Services | Prevents overall financial margins |
| **Comercial** | `comercial` | `40` | Calculator, Dashboard, Clients, Quotes | Prevents viewing unit margin or base chemical product cost |
| **Técnico** | `tecnico` | `20` | POPs, Clients, Services | Hides pricing entirely |
| **Visualizador** | `visualizador` | `10` | Dashboard, POPs, Clients | Read-only |

---

## 2. Information Security Standards

### 2.1 Financial Protection Policy
Lower-level roles like fields technicians, operators, and advisors are strictly forbidden from viewing real-world financial margins, raw compound cost rates, and business base rate calculations. This prevents leakage of internal profit indices and margin data.
The UI implements masking layers via the `<FinancialGuard>` layout filter.

### 2.2 Calculations Engine Access Guard
Formulas inside the pricing calculator are governed directly by active role hierarchy validation. Technical roles can view the required chemically derived quantities of compounds, but cannot override chemical unit costs (`unitCost`, `costPerHour`, etc.).

---

## 3. Storage Offline Integration

The security configuration caches permissions within the IndexedDB `SETTINGS` key upon successful login.
1. **Offline Operations Cache**: If connectivity drops, actions use local permission configurations.
2. **Post-Synchronized Auditing**: If an operation occurs offline, the ledger saves actions locally and flushes audits back to Firebase once the connections are restored.

---

## 4. Audit Log Policies

High-impact actions trigger an immutable event write to the `audit_logs` collection:
- `auth`: Logins, logouts, multi-device triggers
- `financial`: Pricing alterations, budget exports
- `security`: Override permissions, profile changes
- `calculations`: Dynamic chemical pricing updates
