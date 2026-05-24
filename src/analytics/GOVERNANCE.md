# DDSulf Analytics, Business Intelligence & KPI Governance

This document describes the design standards, aggregations, security constraints, and predictive regression metrics implemented in the DDSulf Business Intelligence (BI) layer.

---

## 1. Directory Structure Blueprint

The `src/analytics/` directory is organized into separate domains:

```
src/analytics/
├── dashboards/      # Modular widget dashboards
├── metrics/         # Core metrics definitions and calculations
├── kpis/            # Standard KPI evaluation registries
├── aggregations/    # Real-time state aggregation filters
├── financial/       # Profitability and margin calculators
├── operational/     # Visits duration, check-in completion rate
├── forecasting/     # Margin trends projection regressions
├── intelligence/    # Insights ready behavioral adapters
├── comparisons/     # Historical comparator metrics
├── reports/         # Operational activity logs reports
├── hooks/           # Exported React Hooks hook components
├── services/        # Singleton BI calculations engines
└── types/           # Strongly typed standard declarations
```

---

## 2. Dynamic Performance Parameters

KPI calculations are parsed in real time according to selected periods:

| Goal KPI | Period 7d | Period 30d | Period 90d | Computation Algorithm |
| :--- | :--- | :--- | :--- | :--- |
| **Volume de Atendimentos** | 24 | 112 | 368 | Sum of completed O.S. entries |
| **Margem Operacional** | 34.5% | 32.2% | 28.6% | `(Revenue - ChemicalCosts - TravelCosts) / Revenue` |
| **Ticket Médio** | R$1.450 | R$1.520 | R$1.480 | `TotalSales / Count(Sales)` |

---

## 3. Financial Governance

- **Technician Profile Masking**: If a user log states `role === 'tecnico'`, all financial values (revenue, margins, material unit expenditures) are returned as `0` or `N/A`.
- **Administrative Transparency**: Full operational profit ratios are decrypted only for `admin`, `super_admin` and `financeiro` roles.
- **Local Cache Performance**: Core metrics calculations cache values in local storage, reducing CPU utilization during rapid page switching or offline state intervals.
