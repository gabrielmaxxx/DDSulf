# DDSulf Reporting Architecture, Exports & Formatting Governance

This document outlines the layout rules, document templates structures, and permissions gates securing executive downloads in DDSulf.

---

## 1. Directory Structure

```
src/reporting/
├── templates/     # Structural document styling templates
├── executive/     # Consolidated KPIs executive summaries
├── operational/   # Field technician workflow completions logs
├── financial/     # Guarded profit and revenue logs reports
├── rendering/     # Safe SVG to canvas and file rendering maps
├── scheduling/    # Deferred email summaries scheduling queue
├── hooks/         # Exported React Hooks components
├── services/      # Reporting calculation pipelines
└── types/         # Strongly typed layout parameters definitions
```

---

## 2. In-Memory Rendering Flow

```
[Request Report] ---> [Verify Role Credentials] ---> [Inject Metrics Context]
                                                                |
                                                                v
[Trigger Download] <--- [Format CSV or vector SVG Layout] <--- [Tick Progress Worker (100%)]
```

- **Pristine Layout Blocks**: Raw tables are strictly prohibited from exporting as-is. Layout margins, corporate color accents, and certified safety seals are dynamic in vectors format.
- **Data Encapsulation**: Financial and executive reports are entirely shielded from field technicians and viewer access profiles.
- **Offline Download Continuity**: Generated documents are stored locally in the outbox snapshots repository, supporting field-level viewing where cellular coverage is poor.
