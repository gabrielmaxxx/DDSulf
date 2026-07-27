# 📋 Protocolo de Validação Manual dos Fluxos Operacionais (PestFlow Dedetização)

Este é um script de testes manual (checklist) para validação integral da conectividade das regras de negócio entre os módulos de **Orçamentos**, **Confirmações**, **Agenda semanal**, **Financeiro** e **Estoque**.

---

## 🛠️ FLUXO 1: Orçamento ➔ Agenda (Caminho Feliz)

Esse fluxo valida a conversão completa de um orçamento salvo e aceito pelo cliente até o lançamento de sua receita e baixa de insumos.

| Passo | Ação de Teste | Resultado Esperado | Validação Técnica (Store / Componente) | Status |
| :---: | :--- | :--- | :--- | :---: |
| **1.1** | Abrir o módulo **Calculadora** | Tela do editor de cálculo com premissas de área e produtos operacionais carrega com sucesso. | `/src/modules/calculator/` / `CalculatorPage` | [ ] |
| **1.2** | Preencher as informações obrigatórias:<br>• Cliente: *Ex: Condomínio Garden*<br>• Serviço: *Dedetização*<br>• Área (m²): *Ex: 200*<br>• Distância (km): *Ex: 15*<br>• Produtos operacionais selecionados | O motor de precificação e custos calcula a margem alvo operacional automaticamente. | `useSystemStore` ➔ `quotes.currentQuote` | [ ] |
| **1.3** | Clicar em **"Salvar orçamento"** | O orçamento é registrado no estado global e gera um ID temporário. O sistema exibe um Toast de sucesso. | `useSystemStore` ➔ `addQuote(quote)` | [ ] |
| **1.4** | Ir para a tela de **Confirmação de Serviços** | O painel de triagem de status carrega exibindo as listagens de aceite. | `/src/modules/confirmacoes/` / `ServicoConfirmacaoPage` | [ ] |
| **1.5** | Verificar que o orçamento aparece na seção de **"Aguardando Aceite"** | O card do cliente correspondente é listado com o valor correto e o selo de pendência. | `useSystemStore` ➔ `quotes.list` com status `'gerado'` | [ ] |
| **1.6** | Clicar em **"Cliente aceitou — agendar"** | O modal de definição técnica abre na interface do usuário. | Painel de controle de confirmação abre o estado local `isScheduleModalOpen` | [ ] |
| **1.7** | Verificar que o modal **AgendarServicoModal** abre preenchido | Dados de cliente, tipo de controle, e endereço vêm pré-carregados. | `AgendarServicoModal` herda dados da Quote selecionada | [ ] |
| **1.8** | Informar: **Data fictícia no futuro**, **Horário (faixa)**, e **Técnico escalado** | Os campos aceitam digitação e realizam a validação de data obrigatória. | Formulário local `scheduledDate`, `scheduledTime`, `technician` | [ ] |
| **1.9** | Clicar em **"Confirmar agendamento"** | O orçamento transita de status, some da aba pendente, e um novo compromisso técnico é gerado. | `useSystemStore` ➔ `scheduleApprovedQuote(quoteId, date, time, tech)` | [ ] |
| **1.10** | Verificar listagem em **"Agendados"** | O card do orçamento agora reside na aba de agendados com a data técnica vinculada correta. | `quotes.list` status `'agendado'` | [ ] |
| **1.11** | Ir para o módulo **Agenda & Serviços** | O calendário semanal é exibido na coluna principal. | `/src/modules/agenda/` / `AgendaPage` | [ ] |
| **1.12** | Verificar evento no calendário | Na data e horário programados, um card colorido em **amarelo claro** com borda **âmbar** (`pending`) está renderizado no horário correto do técnico. | `useSystemStore` ➔ `agenda` exibe evento `type: 'servico'` | [ ] |
| **1.13** | Clicar no evento na grade ou na lista e, no painel, clicar em **"✓ Confirmar execução"** | Abre o formulário compacto de confirmação técnica direta. | `confirmingEventId` setado no estado do componente | [ ] |
| **1.14** | Preencher observações do serviço executado e clicar em **Salvar / Confirmar** | O evento de agenda transita de cor para **verde (#1D9E75)**, marcando status como confirmado/realizado. | `useSystemStore` ➔ `confirmServiceExecuted(quoteId, confirmedBy, notes)` | [ ] |
| **1.15** | Ir para o módulo **Financeiro** | A receita operacional bruta correspondente ao valor orçado aparece listada no histórico e adicionada ao caixa mensal. | `useSystemStore` ➔ `financial.revenueHistory`/`movements` | [ ] |
| **1.16** | Ir para o módulo **Estoque (Produtos)** | A quantidade atualizada dos produtos que foram pré-calculados no orçamento sofreu **baixa automática proporcional**. | `useSystemStore` ➔ `inventory.products[x].quantity` reduzida | [ ] |

---

## 🛡️ FLUXO 2: Retorno de Garantia Automático

Esse fluxo valida se o sistema gera corretas garantias associadas ao controle químico e re-calcula as margens financeiras mediante o acionamento de rechamados de assistência técnica.

| Passo | Ação de Teste | Resultado Esperado | Validação Técnica (Store / Componente) | Status |
| :---: | :--- | :--- | :--- | :---: |
| **2.1** | Imediatamente após confirmar a execução de um serviço corporativo ou residencial (Fluxo 1) | O barramento de eventos interna o sinaliza e agenda automaticamente um evento com o tipo `retorno` (ou `Manutenção (retorno)`) | `useSystemStore` ➔ `confirmServiceExecuted` chama `applyWarranty()` e cria evento na agenda | [ ] |
| **2.2** | Verificar a **Data do Retorno de Garantia** criado automaticamente no calendário | A data calculada deve ser igual a **hoje + tempo padrão de carência/garantia** associado à praga-alvo combatida. | `getEventDateString(event)` bate com cálculo de dias-limite | [ ] |
| **2.3** | Localizar e **Confirmar o retorno de garantia** na Agenda | O chamado operacional é marcado como resolvido na grade. | `updateAgendaEvent(id, { status: 'confirmado' })` | [ ] |
| **2.4** | Verificar lançamento de custos adicionais no **Financeiro** | O custo do deslocamento e insumos químicos adicionados pelo retorno foi registrado no histórico operacional de custos como débito passivo. | `useSystemStore` ➔ `financial.costHistory` ou `movements` | [ ] |
| **2.5** | Verificar **Margem de Lucro Original** | No módulo do orçamento pai, a margem bruta global foi re-calculada negativamente, refletindo o gasto adicional do rechamado de assistência. | `useSystemStore` ➔ `quotes.list[x].pricing.margin` atualizada | [ ] |

---

## 🛡️ FLUXO 3: Rejeição de Orçamento

Este teste garante que orçamentos desaprovados fiquem retidos no dashboard e não criem poluição visual na agenda do técnico.

| Passo | Ação de Teste | Resultado Esperado | Validação Técnica (Store / Componente) | Status |
| :---: | :--- | :--- | :--- | :---: |
| **3.1** | Criar um orçamento de teste na **Calculadora** | Orçamento criado com sucesso. | `useSystemStore` ➔ `addQuote()` | [ ] |
| **3.2** | Na tela **Confirmação de Serviços**, selecionar o orçamento e clicar em **"Recusar / Rejeitar orçamento"** | A confirmação transita o status da proposta comercial para `'rejeitado'`. | `useSystemStore` ➔ `quotes` status marcado como `'rejeitado'` | [ ] |
| **3.3** | Verificar listagem de pendentes | O orçamento é excluído da lista de pendências imediatas de conversão táctica. | `filteredQuotes` omite registros desaprovados | [ ] |
| **3.4** | Consultar o calendário na **Agenda** | Nenhum evento técnico ou de assistência foi adicionado na data do faturamento ou na escala. | `useSystemStore` ➔ `agenda` não possui nenhum registro correlacionado | [ ] |

---

## ⚠️ Diagnóstico Rápido de Erros no Store / Componentes

Se algum comportamento diferir desta matriz de testes, verifique imediatamente estes pontos-chave de execução técnica:

1. **Falha na baixa de estoque no Fluxo 1:**
   * **Função responsável:** `confirmServiceExecuted` em `/src/store/systemStore.ts`.
   * **Causa comum:** Os produtos não possuem IDs coincidentes correspondentes em `quote.service.products` e `inventory.products`, ou a quantidade disponível cai abaixo de zero sem liberação opicional.

2. **Garantia / retorno automático não criado no Fluxo 2:**
   * **Função responsável:** `confirmServiceExecuted` em `/src/store/systemStore.ts` (bloco de regras de retorno/recorrência).
   * **Causa comum:** Tipo de praga-alvo do orçamento original não coincide com os limites declarados no objeto de parametrização de dias de validade química.

3. **Orçamento rejeitado criando evento fantasma na Agenda:**
   * **Função responsável:** `rejectQuote` ou similar em `/src/store/systemStore.ts`.
   * **Causa comum:** Transição de status comercial duplicada chamando acidentalmente gatilhos de criação de OS.
