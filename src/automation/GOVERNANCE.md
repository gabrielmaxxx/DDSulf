# DDSulf Operational Workflow Automation & Governance

This document describes the mechanics, step-by-step transaction boundaries, and retry limits governing real-time automated workflows in DDSulf.

---

## 1. Engine Execution Sequence

```
[System Event or Trigger] ---> [Rule Evaluation Engine] ---> [Instantiate Workflow]
                                                                        |
                                                                        v
[Transactional Run] <--- [Retry Policy Loop (Max 2)] <--- [Consecutive Step Executions]
```

1. **System Event**: A trigger value changes (e.g. outbox backlog rises to 5 items).
2. **Rule Evaluation**: Resolves query path keys (`payload.backlogCount >= 5`) dynamically inside an isolated evaluator sandbox.
3. **Instantiate**: Registers a unique state tracker in localized storage.
4. **Consecutive Steps**: Traverses sequence actions asynchronously, logging performance trails.
5. **Retry / Fail Secure**: On intermittent step exceptions, waits 50ms and retries (up to 2 times) before transitioning to `failed` and spawning recovery alerts.

---

## 2. Default Rules & Priorities

We enforce strict priorities to handle concurrent automations smoothly:

| Rule Name | Trigger Evaluator | Step 1 Action | Step 2 Action | Priority |
| :--- | :--- | :--- | :--- | :---: |
| **Critical Margin Lock** | `alert.financial.critical` | Lock pricing spreadsheet | Emit AI suggestion | `100` |
| **Connectivity Lag Buffer** | `payload.backlogCount >= 5`| Defer background analytics | *none* | `90` |
| **Stalled Budget Followup** | `payload.abandonedHours >= 24` | Dispatch sanitization proposal | *none* | `80` |

---

## 3. Sandboxed Rule Security

To guarantee offline resiliency and eliminate performance overhead:
- **No Remote `eval()` Execution**: Expression evaluation utilizes nested key resolution pathways to safeguard inputs against client scripting injections.
- **Fail-Safe Caching**: In-memory state recovery ensures interrupted execution queues resume smoothly when mobile networks reconnect.
