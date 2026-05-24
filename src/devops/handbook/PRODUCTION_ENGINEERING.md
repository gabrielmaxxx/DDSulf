# DDSulf Enterprise Production Engineering Handbook
Version: `v1.0.0-governed`  
Status: `BOARD-APPROVED`  
Audited: `May 2026`  

---

## 1. DevOps Governance & Architecture
DDSulf incorporates an event-driven, multi-tenant sandbox methodology to protect the production layer against logical state corruption, unauthorized privilege escalations, and cross-organization leaks. All resources scale automatically in tier-based clusters.

### Service Level Objectives (SLOs)
*   **Average API Latency:** `< 120ms` (São Paulo southamerica-east1 deployment bounds)
*   **PWA Cache Accuracy:** `> 96%`
*   **Critical Fault Mitigation:** `< 5 minutes` automated trigger rollback response.

---

## 2. Release Standards & Compliance Semantic Gating
No code commit enters production branches without passing through the complete Integration Pipeline.
1.  **Strict Named Types Declaration:** Avoid `import type` destructuring of compiled enums or wildcards.
2.  **Server-Side Security Masking:** The Google Gemini API and credit gateways MUST run strictly behind a cloud ingress proxy. Never declare private access tokens prefixed with `import.meta.env.VITE_` inside the client layer.
3.  **Vulnerability Audit:** The dependencies check (`npm audit` or equivalent) must report `0` high/critical vulnerabilities.

---

## 3. Web & Cross-Tenant Deployment Policies
1.  **Canary Rollouts:** High-impact updates scale progressively starting at `10%` user base routing and increment by steps of `20%` after smoke test logs evaluation.
2.  **Service Worker Invalidation:** PWA clients undergo hot-update cache purging. On hotfix deployment, a `PWA Update Register` invalidate task triggers a force-updating service worker registration to prevent stale browser runtimes.
3.  **Active Organization Isolations:** Ensure every single transaction or Firestore read has explicit `tenantId` bounds keys. Cross-tenant reads are blocked on the network layer by secure Firebase database rule sets.

---

## 4. Operational Troubleshooting & Emergency Fallback
In event of incident detection (e.g., Sentry event burst or real-time connectivity latency excess metric spike):
1.  **Immediate Routing Deviation:** Trigger immediate manual or automatic rollback using `RollbackService` to restore the predecessor healthy tag.
2.  **Forensic Timelines Investigation:** Analyze audit records from `/src/devops/services/operationalAutomationService.ts` to locate IP address, action context, and exact stack trace.
3.  **Discharge Mitigation Logs:** Mark the incident report as `resolved` only after verifying that the cache accuracies and latency benchmarks are restored to standard bounds.
