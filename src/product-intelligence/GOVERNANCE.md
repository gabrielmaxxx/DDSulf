# DDSulf Product Intelligence & Telemetry Governance

Este documento define as diretrizes arquiteturais, políticas de privacidade e governança comportamental de dados coletadas sob o escopo de product telemetry e análise de uso operacional do DDSulf.

---

## 1. Telemetry Governance & Privacy Rules

Para garantir a conformidade regulatória corporativa (LGPD aplicada à operação de campo), o rastreamento comportamental de técnicos de controle de vetores segue políticas rigorosas de mitigação de dados sensíveis:

- **Não-Exposição de PII (Personally Identifiable Information)**: Nenhum dado de CPF, senhas, dados bancários de clientes atendidos ou relatórios individuais de saúde de operadores deve transitar no payload dos eventos de telemetria.
- **Anonimização Baseada em Tenant**: Toda agregação é correlacionada via hash de ID do inquilino (TenantId) e chaves genéricas de perfil (`userRole: tecnico_campo | supervisor_operacao`), garantindo análises holísticas sem expor a identidade individual fora do escopo de autenticação do firebase padrão.
- **Retenção Pragmática**: Logs brutos de cliques em nível tático expiram e são consolidados progressivamente em indicadores gerais após 45 dias no banco Firestore principal.

---

## 2. Analytics Tracking Policies

O DDSulf utiliza rastreamento focado em eficácia empírica (Operational Readiness Tracking) em detrimento de métricas de vaidade tradicional (curiosidade de pageviews vazios):

| Evento | Gatilho | Propósito Analítico |
| :--- | :--- | :--- |
| `page_dwell_time` | Transição de Rota (unmount) | Mede em qual painel o operador passa mais tempo aguardando ou preenchendo. |
| `workflow_start` | Início de Wizard de Formulação | Estabelece o denominador mestre de funis operacionais. |
| `workflow_complete` | Finalização de Registro com Sucesso | Indica conversão de fluxo e velocidade operacional média. |
| `page_view` | Entrada em nova guia | Mapeia padrões de fluxo de navegação para detecção de guias ociosas. |

---

## 3. UX Intelligence Rules & Friction Detection

Nossos algoritmos automáticos identificam sinais de impedimento mecânico em campo sob as seguintes premissas de UX:

```
Rage clicks threshold  => 5 clicks consecutivos em área próxima com < 1200ms de intervalo
Validation repeat err  => 3 erros sucessivos em inputs de mesma categoria
Operation latency fail => Latência de API ou processamento local > 2500ms
```

- **Rage Click Engine**: Filtra seletores HTML e os converte em incidências na **Matriz de Atrito**, sugerindo revisões de carregador (loading states) ou feedbacks visuais adicionais no cockpit.
- **Repeat Errors**: Mapeia se a calculadora de dosagem gera taxas elevadas de digitação inválida, disparando otimizações automáticas de máscaras ou preenchimentos inteligentes por Heurística.

---

## 4. Experimentation Standards

A arquitetura prepara o DDSulf para rollouts parciais inteligentes (A/B testing pronto para o futuro):

- **Hash-Segmentação Consistente**: Inquilinos são direcionados à mesma variação (`control`, `variant_a`, `variant_b`) no mesmo dispositivo de maneira consistente, baseados em dispersão numérica baseada em hash de identificadores de sessão. Isso evita que interfaces mudem repentinamente no meio de uma aplicação química em campo.
- **Desativação Centralizada (Circuit Breaker)**: Se uma nova variação apresentar flutuações severas nas taxas de erro capturadas na Matriz de Fricção, a Feature Flag perde prioridade instantaneamente no escrutínio comportamental.

---

## 5. Offline Usage Sync & Event Reconciliation

Sob severa instabilidade de rede ou subsolos sem conexões, as diretrizes de persistência determinam:

1. **Storage Local Buffer**: Armazenagem resiliente imediata em cache serializado no `localStorage` sob estados offline.
2. **Conexão Auto-Recovery**: Reconciliação imediata em lotes (batch operations) assim que o sinal de conexão (triggers `online` globais de rede) for restabelecido.
3. **Estabilidade em Cache**: Logs mantidos mesmo sob encerramento abrupto da aba do navegador para auditoria UX posterior.
