# Diretrizes de Governança e Comunicação Operacional — PestFlow

Este documento estabelece as regras oficiais e padrões de engenharia para o sistema de notificações, alertas críticos e engajamento móvel inteligência do PestFlow, garantindo relevância, timing e mitigando a fadiga de alertas dos operadores e técnicos de saneamento.

---

## 1. Padrões de Severidade de Alertas (Alert Standards)

Para manter a clareza operacional e evitar sobrecarga de alertas secundários, dividimos as mensagens em cinco níveis hierárquicos rígidos:

| Severidade | Descrição Técnica & Operacional | Canais Recomendados | Tempo de Resposta Alvo |
| :--- | :--- | :--- | :--- |
| **Critical** | Risco imediato de dano ambiental, segurança toxicológica ou quebra de SLA financeiro crítico. | In-App, Push, WhatsApp, E-mail | < 5 minutos |
| **High** | Ruptura de estoque de saneantes essenciais, propostas comerciais com margem violada, desvios de rotas ativas. | In-App, Push, E-mail | < 30 minutos |
| **Medium** | Reutilizações de rotas concluídas, solicitações de assinaturas técnicas de termos Anvisa, aprovações pendentes. | In-App, E-mail | < 2 horas |
| **Low** | Atualizações de status gerais em ordens de serviço, limpezas de poços ou sincronizações de dados bem-sucedidas. | In-App | < 12 horas |
| **Informational**| Notícias técnicas de fabricação de defensivos, relatórios agregados semanais, logins de novos operadores. | In-App | Não aplicável |

---

## 2. Governança contra "Fadiga de Alertas" (Anti-Spam Controls)

Para evitar que o PestFlow se torne uma fonte de ruído ou ansiedade para o técnico em campo, aplicamos as seguintes políticas de governança:

1. **Deduplicação Proativa (`dedupKey`):** Alertas recorrentes do mesmo tipo (como falhas sucessivas de GPS ou oscilações de conexão) são agregados em uma única notificação com contador incremental, em vez de disparar dezenas de pop-ups.
2. **Priorização Dinâmica por IA:** Notificações passam por compressão do modelo **Gemini 3.5-Flash** que avalia a relevância contextual em termos de horário de trabalho do operador, escopo da tarefa e região metropolitana onde está localizado o técnico.
3. **Limite Diário por Categoria:** Sincronizações de dados e relatórios gerais possuem um teto fixo de 3 notificações diárias por canal externo.

---

## 3. Protocolos de Período Silencioso (Quiet Hours Rule)

Para garantir descanso e segurança laboral dos operadores de campo, vigora o seguinte protocolo de período silencioso:

* **Janela Padrão:** Das **21:00 às 07:00** (horário de Brasília).
* **Bloqueio Automático:** Notificações de gravidade *Medium*, *Low* e *Informational* são armazenadas em fila local ou em cache offline e entregues estritamente às 07:01 do dia seguinte.
* **Exceção Exclusiva para Incidentes Críticos:** Alertas categorizados como `incident` com severidade `critical` (como vazamento químico ativo, contato com substância controlada ou sinistro rodoviário) **ignoram as barreiras de quiet hours** e acionam pushes de alta prioridade imediatamente.

---

## 4. Política de Contingenciamento de Canais (Multi-Channel Delivery)

A entrega resiliente utiliza um sistema de escada técnica de contingência:

1. **Delivery Inicial:** Envio simultâneo In-App + Notificação Push nativa.
2. **Janela de Abertura:** Se a notificação persistir como `unread` por mais de 5 minutos, e se for de severidade *High* ou superior, o sistema aciona canais secundários de impacto:
   * **Canal Celular:** Integração via WhatsApp de emergência (status `whatsapp`).
   * **Canal Executivo:** Envio de E-mail corporativo com o relatório completo anexado (status `email`).
3. **Rastreabilidade e Latência (Observability):** Toda transição registra a latência em milissegundos (`latenciesMs`) e número de retentativas automáticas (`retryCounts`) para relatórios futuros de SLA.

---

## 5. Diretrizes de Engajamento Operacional

Para que os alertas permaneçam focados na ação prática, toda notificação deve cumprir as seguintes regras de UX:

* **Títulos Descritivos e Diretos:** "Estoque Baixo" é proibido. Prefira: "ALERTA DE ESTOQUE: Fipronil 250ml abaixo do Limite Mínimo".
* **Ações Claras Simples (Quick Actions):** Redirecionamentos e botões diretos de "Ver Detalhes do Acidente", "Rotear Novo Caminho" ou "Liberar Margem" devem estar sempre visíveis abaixo do resumo.
* **Linguagem Humana:** Frases frias ou jargões crípticos são substituídos por alertas em português claro, dinâmicos e focados na solução.
