# PestFlow - DevOps Operational Runbook & Delivery Infrastructure
*Enterprise-Grade High Availability & Incident Management Standards*

---

## 1. Environment Architecture

The PestFlow application separates environments strictly on both Firestore database scopes and CDN networks:

| Environment | Database Cluster | Ingress/App URL | Scaling Tier | Backup Cycle |
| :--- | :--- | :--- | :--- | :--- |
| **Development** | `pestflow-staging-ef911` (sandbox) | Local + AIS Dev | F1 Micro | On-demand |
| **Staging** | `pestflow-staging-ef911` | AIS Pre-production | F2 Medium | 24 Hours |
| **Production** | `pestflow-prod-aed10` | App Production Domain | F4 Custom High-RAM | 6 Hours |

---

## 2. Deployment Pipeline (CI/CD)

Every pull request to `main` undergoes a rigorous validation process sequence:

1. **Static Lint Audits**: Avoid console bugs through severe ESLint rules enforcement.
2. **Strict Type Validation check**: Run `tsc --noEmit` before any client build starts.
3. **Stand-alone Bundle compilation**: Bundles production asset output inside the `/dist` filesystem.
4. **Deploy rolling releases**: Reroutes standard CDN pathways to newer releases cleanly while maintaining previous tags active in parallel.

---

## 3. Disasters Recovery & Rollback Policy

In the event of elevated alert notifications, unexpected runtime bugs (unresolved exceptions list exceeding 1% of page accesses in a 5-minute interval):

### Recovery Playbook

1. Go to the **DevOps & Observability** dashboard embedded on the Master layout.
2. Under **Implantação & Rollback**, identify the previous green deployment record tag (e.g., `v2.4.1` with a `healthy` tag).
3. Click on the button **Reverter Versão**.
4. Traffic is immediate re-routed from CDN edge, and an absolute cache invalidation signal triggers on active PWAs.
5. Alternatively, launch the terminal execution fallback sequence:
   ```bash
   cd .devops/scripts/
   ./rollback.sh v2.4.1 production
   ```

---

## 4. Prompt-Ops & GenAI Versioning

Prompt-Ops operates decoupled from primary application deployment life cycles. Updating prompt templates (e.g., changing rules for active vector dosage recommenders in `pest_dosagem_v1`) is instantaneous. It saves version changes mapping into active DB documents, ensuring next inference runs utilize corrected instructions immediately without needing code restarts.

---

## 5. Security & Multi-Tenant Rollouts

* **Isolated Keys**: Multi-tenancy isolation holds correct contextual boundaries. No tenant possesses any visible mechanism accessing records of adjacent businesses.
* **Progressive Feature Releases**: Managed dynamically. Gradual introduction of items like `dynamic_offline_syncloop_v2` is mapped using the settings file `.devops/configs/feature-rollout.json`, protecting offline caching performance globally.
