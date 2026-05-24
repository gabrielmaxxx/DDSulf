# DDSulf Event-Driven Notifications & Operational Intelligence Governance

This document describes the alerts prioritization rules, operational alarm hierarchies, and fatigue suppression parameters governing real-time alerts.

---

## 1. Event Propagation Flow

```
[System Trigger Event] ---> [EventBusService] ---> [OperationalIntelligenceService]
                                                              |
                                                              v
[In-App Alerts List]  <--- [NotificationService] <--- [AlertPrioritizationEngine]
```

1. **System Trigger Event**: Action completes (e.g. calculation margin drops below commercial target).
2. **EventBusService**: Event is announced onto the lightweight client bus.
3. **OperationalIntelligence**: Assesses structural metrics, and generates a corresponding alert payload.
4. **AlertPrioritizationEngine**: Inspects duplication timers (`dedupKey`), runs relevance tests, and adjusts severity weights.
5. **NotificationService**: Matches target role permissions and delivers the alert to the local client state buffers.

---

## 2. Notification Severity Matrix

The operational center routes alerts based on five defined levels of urgency:

| Severity Level | Color Code | Deliver Methods | Contextual Threshold Trigger |
| :--- | :---: | :---: | :--- |
| **Critical** | Rose-500 | In-App, Push | Margin drops below 10%, catastrophic chemical waste |
| **High** | Amber-500 | In-App, Push, Email | Draft proposed budget stalled for over 48 hours |
| **Medium** | Yellow-500 | In-App | Standard price deviation or field synchronization delays |
| **Low** | Blue-500 | In-App | General progress milestones or checklist completion |
| **Informational** | Neutral-500 | Passive Logs | Minor updates or normal sync completions |

---

## 3. Alarm Fatigue Prevention Policy

To protect field technicians and regional managers against visual clutter, the platform enforces specific fatigue safeguards:
1. **Deduplication Windows**: Alerts containing identical `dedupKey` fingerprints are suppressed for 5 minutes after delivery.
2. **Adaptive Accumulators**: Instead of printing multiple entries, recurring alerts update the active event's timestamp, pulsing the existing visual node.
