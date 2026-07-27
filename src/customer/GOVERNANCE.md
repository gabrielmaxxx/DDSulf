# PestFlow Customer Relationship & Operational Experience Governance

This document describes the customer portal safeguards, LTV computations, and retention structures securing CRM interactions in PestFlow.

---

## 1. Directory Structure

```
src/customer/
├── portal/          # Real-time Customer access structures
├── relationships/   # Loyalty analysis and churn reduction flags
├── recurrence/      # Predictive overdue cycles trackers
├── history/         # Full timeline checklist completions logs
├── services/        # Customer storage registry, NPS and metrics
├── analytics/       # Retention counts and cohort charts data
├── satisfaction/    # Average customer score triggers
├── recommendations/ # Segmented chemical pesticide suggestions
├── hooks/           # Exported React Hooks components
└── types/           # Strongly typed CRM schemas
```

---

## 2. Retention Metrics Calculations

- **Loyalty Value (LTV)**: Proactively accumulated as `sum(PaidServiceValues)` inside database records.
- **Cycle Exceed Limits (Overdue Days)**: If `Date.now() - LastServiceDate > SuggestedInterimDays`, the customer is flagged with premium renewal suggestions.
- **Isolamento de Negócios (Privacy Boundary)**: Clientes e frotas de técnicos de campo externos possuem bloqueio absoluto de visualização para faturamento corporativo consolidado e margens líquidas operativas de rotas.
