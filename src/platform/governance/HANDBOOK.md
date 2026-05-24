# DDSulf Platform Governance Handbook

Este manual descreve as diretrizes de governança corporativa, as divisões de squads de tecnologia e o ciclo de homologação tática da arquitetura do DDSulf.

---

## 1. Squad Allocations & Module Ownerships

Para evitar crescimento desordenado e garantir robustez, cada módulo é de responsabilidade estrita de uma Squad de engenharia dedicada:

- **Core UX Squad**: Responsável pela navegação mestre, layout responsivo e o Dashboard de controle de campo.
- **Product Engineering Squad**: Mantém a calculadora operacional, modelos mecânicos e dosagens químicas.
- **AI Platform Squad**: Desenvolve, audita e calibra prompts orientados na heurística do controle de pragas.
- **Supply Chain Engineering**: Responsável pela logística de depósitos, pesagem física de estoques e embalagens.

---

## 2. Compliance Checkpoints

Antes de promover qualquer alteração experimental ou novo recurso para a base de produção, a engenharia deve validar as seguintes políticas:

1. **Adesão de Tipo**: Proibido anotações do tipo `any` sem aprovação prévia. Anotações explícitas de tipos TypeScript são obrigatórias em interfaces externas.
2. **Mitigação de Latência**: APIs críticas devem executar abaixo de 800ms. Latências anormais devem ser capturadas pela Matriz de Fricção local.
3. **Padrão de Visualização Única**: Módulos táticos devem priorizar visualização única (single view layout) no dispositivo móvel do operador para evitar confusão sensorial.
