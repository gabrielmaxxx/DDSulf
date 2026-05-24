# DDSulf SaaS Platform Governance

Este estatuto de governança comercial e arquitetura SaaS regula a integridade do isolamento multi-inquilino de DDSulf.

---

## 1. Multi-tenant Isolation Architecture
Todos os dados estruturais gravados na base do Cloud Firestore e nos mecanismos de cache locais devem conter o cabeçalho indexador `tenantId`, garantindo a separação absoluta de inventários, ordens de serviços, relatórios Anvisa e faturamentos fiscais de dedetizadoras adversárias operando na mesma infraestrutura.

---

## 2. Operational Feature Gating
O acesso a novas funcionalidades é mediado através de restrições de planos:
- **Dispositivos Adicionais**: Limitado de acordo com a cota ativa do plano.
- **Inteligência Artificial (Gemini Core)**: Habilitado apenas nos planos Professional e Enterprise para evitar vazões excessivas de custos de IA em contas de teste gratuitas.
