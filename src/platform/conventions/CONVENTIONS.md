# DDSulf Platform Conventions

Este documento consolida as convenções sintáticas recomendadas para garantir a uniformidade estrutural de componentes no ecossistema DDSulf.

---

## 1. Naming Standards

- **React Components**: CamelCase começando com maiúscula (`CalculadoraDoses.tsx`, `AppSidebar.tsx`).
- **React Hooks**: Prefixo `use` com camelCase (`useBehaviorAnalytics.ts`, `usePlatformGovernance.ts`).
- **Global Services**: Singleton instanciado ao final do arquivo (`telemetryService.ts`, `governanceService.ts`).
- **Interfaces e Enums**: Criados preferencialmente em arquivos centrais `types.ts` ou `types/index.ts`.

---

## 2. Directory Structure Conventions

Para assegurar o desacoplamento absoluto, nenhum módulo operacional tático deve referenciar imports privados de outro módulo irmão diretamente. Toda comunicação e permuta de dados deve usar contratos de integração estáveis ou hooks globais fornecidos pela camada de plataforma:

- `/src/components/`: Componentes genéricos de UI altamente encapsulados (como botões, cards, barras de progresso).
- `/src/platform/`: Governança, limites de escalabilidade, compliance de tipos e auditoria arquitetural.
- `/src/product-intelligence/`: Telemetria, matriz comportamental de fricção, IA preditiva e experimentos A/B.
- `/src/modules/`: Regras de negócio segmentadas por contextos (`/dashboard`, `/ai`, `/pops`).
