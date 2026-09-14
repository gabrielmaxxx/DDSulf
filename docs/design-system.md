# Sistema de Design do PestFlow (`docs/design-system.md`)

Este documento consolida os padrões visuais, tipográficos e componentes estruturais do **PestFlow**, alinhados com as referências aprovadas pela liderança.

---

## 1. Padrões Existentes Consolidados (Não Necessitam de Alteração)

Os seguintes elementos de interface já foram rigorosamente testados, validados e seguem com exatidão o padrão de referência aprovado, **não necessitando de qualquer modificação**:

### 1.1 Paleta de Cores Institucional
- **Verde Floresta Noturno (`#1B3A2D`):** Cor primária de ênfase máxima (abas ativas, botões primários de alta prioridade, cabeçalhos de destaque).
- **Verde Operacional (`#2D6A4F`):** Variações secundárias e indicadores de conformidade operacional.
- **Neutros Quentes Estruturais (`#F0EDE8`, `#F5F3EF`, `#141410`):** Fundo de contêineres de abas, contrastes suaves e tipografia primária de alta legibilidade.
- **Semântica Positiva/Negativa:** Verde Esmeralda (`text-emerald-600`) para ganhos/tendências positivas e Vermelho Rosa (`text-rose-600`) para quedas/riscos.

### 1.2 Barra de Abas (Pílula Única com Rolagem Horizontal)
- Padrão padronizado em **Estoque (`InventoryTabs`)**, **IA Operacional (`AIPage`)** e **Gestão Financeira (`FinancialPage`)**:
  - Contêiner externo: `<div className="flex overflow-x-auto p-1.5 bg-[#F0EDE8]/60 border border-slate-200/60 rounded-2xl w-fit max-w-full shadow-inner">`
  - Lista de abas: `<TabsList className="h-auto p-0 gap-1 bg-transparent">`
  - Gatilho com estado ativo Radix/Tailwind: `data-[state=active]:bg-[#1B3A2D] data-[state=active]:text-white data-[state=active]:shadow-sm whitespace-nowrap`
- **Comportamento:** Todas as abas permanecem em uma única linha contínua, sem quebras indesejadas, oferecendo rolagem horizontal suave em telas menores.

### 1.3 Balões de Chat da IA Operacional
- Layout de mensagens limpo, focado em agilidade de leitura para o operador:
  - Balões do assistente com fundo neutro suave e tipografia estruturada.
  - Balões do usuário em destaque verde floresta com contraste nítido.
  - Ações rápidas contextuais (prompts sugeridos) em chips compactos.

---

## 2. Novo Padrão de Métricas de Cabeçalho (`HeaderMetric`)

O componente `HeaderMetric` (`src/components/HeaderMetric.tsx`) introduz uma forma limpa, direta e visualmente elegante de exibir números e KPIs de alto nível no cabeçalho das páginas, sem poluição visual.

### 2.1 Princípios Visuais
- **Sem bordas, sem caixas e sem fundos:** A força do componente vem unicamente da clareza tipográfica e do respiro visual (whitespace).
- **Rótulo Superior:** Pequeno, em cinza neutro (`text-slate-500`), caixa alta (`uppercase`) e rastreamento expandido (`tracking-wider`).
- **Valor Central:** Número grande e em negrito (`text-2xl md:text-3xl font-bold tracking-tight text-slate-900`), facilitando a leitura imediata (em menos de 1 segundo).
- **Variação Inferior (Delta Opcional):** Indicador de tendência com ícone direcional e cor semântica (`text-emerald-600` para subida, `text-rose-600` para queda, `text-slate-500` para neutro).

### 2.2 Interface do Componente
```typescript
interface HeaderMetricProps {
  label: string;                                                      // Rótulo descritivo (ex: "Receita Total (Mês)")
  value: string;                                                      // Valor formatado (ex: "R$ 145.320,00")
  delta?: {
    value: string;                                                    // Ex: "+8,2%" ou "-3,1%"
    direction: 'up' | 'down' | 'neutral';                             // Direção da tendência
  };
  className?: string;
  id?: string;
}
```

### 2.3 Regra de Uso: Quando Usar vs. Quando Manter Badges

| Cenário | Componente Recomendado | Justificativa |
| :--- | :--- | :--- |
| **KPIs Mais Importantes da Página** | `<HeaderMetric />` | Ficam no cabeçalho ao lado do título da tela ou em linha de métricas principais. Máximo de 3 a 4 por tela para não sobrecarregar. |
| **Status Operacional / Conexão** | `<Badge />` com borda e fundo | Status como "Online", "Em Andamento", "Concluído", "Offline" exigem delimitação em pílula colorida com borda para rápido reconhecimento de estado. |
| **Contadores Secundários de Itens** | Badge/Chip pequeno | Contadores ao lado de títulos de seção (ex: "12 itens", "3 alertas") ou badges nas abas devem permanecer pequenos e contidos. |
| **Tags de Classificação e Categoria** | `<Badge variant="outline" />` | Identificadores de clientes, tipos de praga ou setores de atendimento. |

### 2.4 Exemplo de Implementação

```tsx
import { HeaderMetric, HeaderMetricGroup } from "@/components/HeaderMetric";

export function ExemploCabecalho() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Gestão Financeira</h1>
        <p className="text-sm text-slate-500">Acompanhamento consolidado de DRE e fluxo de caixa.</p>
      </div>

      {/* Métricas sem caixa nem borda — puro impacto tipográfico */}
      <HeaderMetricGroup>
        <HeaderMetric
          label="Receita do Mês"
          value="R$ 145.320,00"
          delta={{ value: "+8,2% vs. mês ant.", direction: "up" }}
        />
        <HeaderMetric
          label="Margem Operacional"
          value="26,4%"
          delta={{ value: "+1,8%", direction: "up" }}
        />
        <HeaderMetric
          label="Ponto de Equilíbrio"
          value="R$ 58.400,00"
          delta={{ value: "-4,1%", direction: "down" }}
        />
      </HeaderMetricGroup>
    </div>
  );
}
```

---

## 3. Diretrizes de Governança
1. **Nenhuma tela deve ser modificada arbitrariamente** sem prévio planejamento da hierarquia das 3-4 métricas selecionadas.
2. A barra de abas e os componentes de chat devem manter a fidelidade estabelecida sem regressões visuais.
