# PestFlow Business Intelligence & Operational Analytics Governance Standard
> Diretrizes e Políticas de Consistência Métrica, Rastreabilidade de Tenant e Regras de Forecast

---

## 📡 1. BI Architecture & Tenant Segregation
Toda a infraestrutura de Business Intelligence do PestFlow opera sob as rígidas diretrizes do paradigma *Multi-Tenant Isolador*:
- **Filtro de Contexto em Nível de Linha (RLS):** É expressamente proibido consolidar faturamento ou volumes químicos entre as filiais Erechim HQ, Passo Fundo e Santa Maria sem anexar a chave `tenantId` correspondente.
- **Cache Local Protetor:** Para garantir desempenho offline-first no campo, agregações de faturamento e taxas de atividade são cacheadas e atualizadas incrementalmente, reduzindo leituras redundantes no Google Cloud Firestore.

---

## 🔬 2. KPI Governance Matrix
Os indicadores chaves do PestFlow seguem regras matemáticas unificadas para evitar inconsistências contábeis rurais.

| Chave KPI | Nome Oficial | Escopo Técnico | Fórmula de Cálculo |
| :--- | :--- | :--- | :--- |
| `margin_total` | Margem de Lucro Geral | Produtividade Financeira | `((Faturamento - Insumos - Custo Técnico) / Faturamento) * 100` |
| `ticket_medio` | Ticket Médio Sanitário | Rampa Comercial | `Faturamento Total / Total de OS Executadas` |
| `technical_efficiency` | Eficiência Horária | Operações de Campo | `(Horas em Aplicação Ativa / Horas Totais de Turno) * 100` |
| `customer_retention` | Retenção Contratual POP | Vínculo de Longo Prazo | `(Renovações Ativas / Total de Vencimentos do Período) * 100` |

---

## 📈 3. Forecasting Guidelines
As estimativas de tendências biológicas e consumo agroquímico utilizam o algoritmo preditivo baseado em rampa térmica:
- **Coeficiente Sazonal de Praga:** Multiplicador dinâmico de 1.0 a 4.5 calibrado mensalmente de acordo com a temperatura regional média histórica do Rio Grande do Sul.
- **Estoque Preditivo Recomendado:** Evita excesso ou obsolescência de fungicidas e inseticidas regulando a carga de ativos conforme umidade e calor estimados no quadrante rural.

---

## 🚨 4. Decision Engine Principles
Recomendações inteligentes disparadas por algoritmos preditivos devem ser auditáveis para conformidade com a Vigilância Sanitária:
- No caso de variações de diluição perigosas ou custos de transporte excedendo 65% da rampa tarifária operacional, o sistema emite uma diretriz recomendada de auditoria imediata.
