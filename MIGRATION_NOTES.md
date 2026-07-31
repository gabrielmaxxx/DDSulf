# PestFlow — Notas de Migração Multi-Tenant (Fase 1: Fundação)

## Overview
Este documento consolida o inventário de coleções, repositórios, serviços e endpoints do PestFlow adaptados do modelo **single-tenant** (DDSulf) para a arquitetura **multi-tenant** com isolamento estrito por empresa (`/empresas/{empresaId}/...`).

---

## 1. Mapeamento do Schema de Coleções

Todas as coleções operacionais e gerenciais foram migradas para subcoleções aninhadas no documento da empresa correspondente em `/empresas/{empresaId}`.

### Documento Raiz do Tenant
- **Caminho**: `/empresas/{empresaId}`
- **Campos**: `nome`, `cnpj`, `criadoEm`, `status` (`"ativa"` | `"inativa"` | `"trial"`)

### Subcoleções por Empresa (`/empresas/{empresaId}/...`)

| Nome da Subcoleção | Coleção Anterior (Single-Tenant) | Descrição do Conteúdo |
| :--- | :--- | :--- |
| `users` | `/users` | Perfis de usuários e papéis de acesso do tenant |
| `clients` | `/clients` | Cadastro de clientes da empresa |
| `quotes` | `/quotes` | Orçamentos e propostas comerciais |
| `services` | `/services` | Ordens de serviço e execuções técnicas |
| `financial_costs` | `/financial_costs` | Custos fixos, variáveis e operacionais |
| `revenues` | `/revenues` | Entradas financeiras e faturamento |
| `products` | `/products` | Catálogo de produtos e insumos do estoque |
| `stock_movements` | `/stock_movements` | Histórico de movimentações de estoque |
| `pops` | `/pops` | Procedimentos Operacionais Padrão |
| `dashboard_metrics` | `/dashboard_metrics` | Métricas pré-agregadas para dashboard |
| `historical_insights` | `/historical_insights` | Padrões analíticos de execução |
| `events` | `/events` | Barramento de eventos e audit log |
| `audit_logs` | `/audit_logs` | Trilha de auditoria e segurança |
| `draft_quotes` | `/draft_quotes` | Rascunhos de orçamentos em elaboração |
| `agenda` | `/agenda` | Agendamentos de serviços |
| `contracts` | `/contracts` | Contratos com clientes |
| `garantias` | `/garantias` | Certificados de garantia emitidos |

---

## 2. Inventário de Arquivos de Serviços e Repositórios

Os seguintes arquivos realizam operações de leitura/escrita no Firestore e foram refatorados para exigir o parâmetro `empresaId`:

### Repositórios e Acesso Genérico
- `src/tenant/tenantContext.ts`: Utilitários para contexto de tenant e geração de caminhos `/empresas/{empresaId}/{collectionName}`.
- `src/firebase/repositories/BaseRepository.ts`: Classe base abstrata para repositórios com escopo de tenant.
- `src/firebase/repositories/UserRepository.ts`: Repositório de usuários do tenant.
- `src/firebase/repositories/InventoryRepository.ts`: Repositório de estoque e movimentações.
- `src/firebase/repositories/QuoteRepository.ts`: Repositório de orçamentos.
- `src/services/firestore/BaseFirestoreService.ts`: Serviço base Enterprise com suporte a `empresaId`.

### Helpers e Utilitários de Firestore
- `src/firebase/firestore/index.ts`: Funções utilitárias CRUD (`getDocument`, `createDocument`, `addDocument`, `updateExistingDocument`, `removeDocument`, `queryDocuments`, `subscribeCollection`, `executeBatchWrite`).
- `src/firebase/queries/index.ts`: Execução de queries compostas.
- `src/firebase/listeners/index.ts`: Listeners em tempo real.
- `src/firebase/batch/index.ts`: Operações em lote (batch writes).

### Serviços Específicos por Domínio
- `src/firebase/services/quotes.ts`: Serviço de orçamentos.
- `src/firebase/services/financial.ts`: Serviço de finanças.
- `src/firebase/services/inventory.ts`: Serviço de estoque.
- `src/firebase/services/pops.ts`: Serviço de POPs.
- `src/firebase/services/dashboard.ts`: Serviço de métricas de dashboard.
- `src/firebase/services/analytics.ts`: Serviço de insights históricos.
- `src/firebase/services/auth.ts`: Perfil e autenticação de usuário.
- `src/modules/dashboard/services/analyticsService.ts`
- `src/modules/financial/services/financialService.ts`
- `src/modules/inventory/services/inventoryService.ts`
- `src/modules/pops/services/popService.ts`
- `src/modules/ai/services/analyticsEngine.ts`
- `src/financial/profitability/services/marginService.ts`
- `src/financial/services/costEngineService.ts`
- `src/calculator/workflow/services/workflowService.ts`
- `src/calculator/workflow/services/draftService.ts`
- `src/calculator/services/pricingService.ts`
- `src/security/services/auditService.ts`
- `src/security/audit/index.ts`
- `src/integration/services/eventBusService.ts`
- `src/dashboard/services/analyticsEngine.ts`
- `src/dashboard/services/realtimeAnalytics.ts`
- `src/realtime/synchronization/syncEngine.ts`
- `src/realtime/listeners/firestoreListeners.ts`
- `src/offline/sync/index.ts`

---

## 3. Endpoints Express (`server.ts`) e Contexto do Tenant

Endpoints que recebem/processam dados com escopo de tenant em `server.ts`:
- `/api/health`
- `/api/maps/status`, `/api/maps/geocode`, `/api/maps/distance`
- `/api/ai/chat`, `/api/ai/pestflow-chat`, `/api/ai/analyze-notification`, `/api/ai/generate-procedure`, `/api/executive-ai/query`

**Middleware de Contexto (`getTenantContext`)**:
- Extrai o tenant do header HTTP `x-empresa-id` (ou `x-tenant-id`).
- Na ausência do header, utiliza a constante padrão `DEFAULT_EMPRESA_ID` (`'ddsulf'`).
- Contém o marcador de evolução `// TODO(fase-2): substituir por empresaId extraído do custom claim do token`.

---

## 4. Premissas Single-Tenant Eliminadas

1. **Acesso Global sem Escopo**: Eliminada qualquer referência direta a coleções de nível raiz como `collection(db, 'quotes')`.
2. **Segurança por Padrão**: As regras em `firestore.rules` foram reestruturadas sob `match /empresas/{empresaId}` com verificação de `request.auth.token.empresaId == empresaId`.
3. **Isolamento de Dados em Queries**: Todas as queries e buscas agora filtram e acessam estritamente o subcaminho do tenant especificado.
