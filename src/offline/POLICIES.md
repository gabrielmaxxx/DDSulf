# DDSulf Sync Infrastructure & Offline Governance Policies

This document specifies the distributed convergence invariants, data serialization, and transactional alignment standards governing field systems.

---

## 1. Offline & Sync Governance

1. **FIFO Outbox Serialization**: Outbound mutations buffer under `mutations_queue` in IndexedDB. They MUST execute strictly FIFO (First-In, First-Out) sorted by ascending client execution timestamps (`timestamp`) to prevent out-of-order state overrides.
2. **Tab Visibility Throttling**: Background sync intervals drop from 20s down to complete pause when tabs go invisible. This conserves battery packs on mobile terminals of field technicians.
3. **Write Isolation**: A client MUST NOT write into Firestore collections directly during offline sync; it wraps mutations inside the `OfflineMutationEngine` to let background loops negotiate transit and lock gates.

---

## 2. Distributed Reconciliation & Conflict Resolution

1. **Last-Write-Wins (LWW) Standard**: Field states merge based on ISO-timestamp check comparisons.
2. **Checklist & Array Array Merges**: Instead of complete property overwrites on list fields, checklist/array adjustments merge using distinct sets to prevent duplicated technician activities or skipped security POP checklist checks.
3. **Financial Margins Safety Gate**: Cost tracking figures (`suggestedPrice`, `amount`, `estimatedMargin`) skip stamp checks and prefer higher precision values to protect business unit metrics against rounding drifts.

---

## 3. Disaster recovery standard

1. **Stuck Mutations Triage**: Failed transactions (due to temporary quota resets or client network hops) trigger auto-reset flags to retry in succeeding windows.
2. **Draft Autosave Lifetime**: Incomplete draft quote wizard steps remain cached up to a maximum period of 3 days. Completed submissions trigger direct purge buffers to preserve devices' storage indices.
