# DDSulf Realtime Operational & Sync Infrastructure Guidelines

Welcome to the DDSulf live core. This system manages distributed state, offline-first client replication, cost metrics recalculations, and ABAC-guarded Firestore pipelines.

---

## 1. Architectural Architecture Breakdown

```
       [ Client React View ]
         ▲               ▲
         │               │ (Hooks)
  [Event Bus]     [Sync Status & Registry]
         ▲               ▲
         │ (Events)      │ (De-duplicated Streams)
  [Services & Engines] ──┘    
  (Calc, Workflow, Financial)
         ▲
         │ (Offline Queue / Latency check)
  [IndexedDB Persistence Queue]
         ▲
         │ (Reconciliated Batching)
   [Firebase Firestore Cloud Sinks]
```

The system is split into independent micro-modules:
1. **Types (`/types/`)**: Deep interface declarations for users, synchronization actions, and calculation breakdowns.
2. **Utilities (`/utils/`)**: High-performance debouncers, data-saving buffers, and byte estimators.
3. **Event Bus (`/events/`)**: Decoupled messaging channels (Pub/Sub).
4. **Reconciliation Engine (`/reconciliation/`)**: Last-Write-Wins (LWW) resolution and safe list merges.
5. **Offline Queue (`/offline/` & `/queue/`)**: IndexedDB persistent log that queue write operations and handles priorities (e.g. quotes get higher queue placement).
6. **Sync Engine (`/synchronization/`)**: Evaluates internet latency, listens to visibility changes to save background energy, and flushes backlog items.
7. **Subscription Registry (`/subscriptions/`)**: Prevents duplicate connections by tracking active pathways and sharing handles.
8. **Firestore Streams (`/listeners/`)**: Secure snapshot bindings that catch permissions errors and format them into structured JSON schemas.
9. **Operational Engines (`/operational/`, `/workflows/`, `/financial/`, `/analytics/`)**: Mathematical cores that compute costs, taxes, leakage margins, and stream KPI statistics.
10. **Custom Hooks (`/hooks/`)**: Simple React bindings managing component mount/unmount subscription lifecycles.

---

## 2. Dynamic Realtime Custom Hooks

Here is how you can use the complete collection of custom hooks inside your React interface:

### 2.1. Dynamic Document Streaming
```typescript
import { useRealtimeSubscription } from '@/realtime';

function QuoteDetail({ quoteId }) {
  const { data: quote, loading } = useRealtimeSubscription<Quote>('quotes', quoteId);

  if (loading) return <Spinner />;
  return <h1>Orcamento para {quote?.clientName}</h1>;
}
```

### 2.2. Network Health & Sync Backlog
```typescript
import { useSyncStatus } from '@/realtime';

function HeaderNetworkIndicator() {
  const { health, backlogCount, forceSync } = useSyncStatus();

  return (
    <div className="flex items-center gap-2">
      <span className={health.isOnline ? 'text-emerald-500' : 'text-rose-500'}>
        ● {health.isOnline ? `Online (${health.latencyMs}ms)` : 'Offline'}
      </span>
      {backlogCount > 0 && (
        <button onClick={forceSync} className="bg-amber-500 text-xs px-2 py-1 rounded">
          Sincronizar {backlogCount} pendentes
        </button>
      )}
    </div>
  );
}
```

### 2.3. Online Calculation Recalculations
```typescript
import { useRealtimePricing } from '@/realtime';

function PricingSimulator() {
  const [area, setArea] = useState(150);
  const [distance, setDistance] = useState(25);

  const breakdown = useRealtimePricing({
    areaSize: area,
    pestType: 'Baratas de Esgoto',
    complexity: 'Média',
    displacementDistance: distance,
    appliedMarginPercent: 65
  });

  return (
    <div>
      <p>Custo Químico: R$ {breakdown.rawChemicalsCost}</p>
      <p>Preço Sugerido com Impostos: R$ {breakdown.finalPriceWithTax}</p>
      <p>Margem Líquida Real: {breakdown.netMarginPercent}%</p>
    </div>
  );
}
```

---

## 3. Governance Policies

1. **Strict Key Verification**: When sending updates to Firestore, use `affectedKeys().hasOnly([...])` to avoid shadow writes.
2. **Never Bind Double Listeners**: Always query and subscribe through the `subscriptionRegistry`.
3. **Optimistic Updates**: Apply state locally instantly, send updates queue to IndexedDB, and let the background worker handle reconciliation.
