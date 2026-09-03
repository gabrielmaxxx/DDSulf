# Convenção e Padrões de Interface do PestFlow (`docs/ui-patterns.md`)

Este documento estabelece as diretrizes arquiteturais e a convenção de experiência de usuário (UX/UI) adotada em todas as telas e módulos do **PestFlow**.

O objetivo central é **garantir clareza visual, previsibilidade na navegação e alto desempenho operacional**, eliminando implementações manuais repetitivas (como modais manuais com `<div className="fixed inset-0 ...">`) e padronizando o ecossistema com base nos componentes robustos do Radix / Base-UI.

---

## 1. Princípio da Hierarquia de Conteúdo em 4 Camadas

Toda tela no PestFlow deve organizar suas informações em quatro níveis bem definidos:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. CONTEÚDO PRIMÁRIO (Sempre visível no fluxo principal da página)     │
│    • Indicadores-chave (KPI cards)                                     │
│    • Barra de busca e filtros rápidos                                  │
│    • Grid / Tabela / Lista principal de dados                          │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
       ┌─────────────────────────────┼─────────────────────────────┐
       ▼                             ▼                             ▼
┌──────────────┐             ┌──────────────┐             ┌─────────────────────┐
│  2. DIALOG   │             │   3. SHEET   │             │ 4. COLLAPSIBLE      │
│ (dialog.tsx) │             │  (sheet.tsx) │             │ (collapsible-       │
│ Ações        │             │ Painéis      │             │  section.tsx)       │
│ secundárias, │             │ auxiliares   │             │ Agrupamento inline  │
│ criação,     │             │ volumosos,   │             │ de dados opcionais  │
│ edição,      │             │ chat IA,     │             │ ou complementares   │
│ confirmação  │             │ logs longos  │             │ na própria tela     │
└──────────────┘             └──────────────┘             └─────────────────────┘
```

---

## 2. As Quatro Camadas em Detalhes

### Camada 1: Conteúdo Primário (Sempre Visível)
* **O que pertence aqui:**
  * Métricas e KPIs essenciais no topo (ex: faturamento do mês, margem média, OSs pendentes).
  * Campo de busca global/local e botões de ação de primeiro nível (ex: "Novo Orçamento", "Novo Cliente").
  * Tabela ou lista paginada dos registros principais.
* **Diretriz:**
  * Esta área nunca deve ser soterrada por formulários gigantescos abertos inline.
  * O operador de controle de pragas precisa identificar o status do dia em menos de 3 segundos ao acessar a rota.

### Camada 2: Ações Secundárias (`src/components/ui/dialog.tsx`)
* **O que pertence aqui:**
  * Formulários de criação e edição de registros (ex: cadastro de cliente, novo produto químico, emissão de OS).
  * Diálogos de confirmação para ações destrutivas ou irreversíveis (ex: excluir item, cancelar contrato).
  * Upload e importação de planilhas/documentos.
  * Configurações pontuais e filtros avançados rápidos.
  * Visualização de detalhes rápidos de um registro.
* **Regra Inviolável:**
  * **PROIBIDO** implementar modais manuais utilizando `<div className="fixed inset-0 ...">`.
  * Toda ação secundária modal deve utilizar `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` e `DialogFooter`.
  * Tamanhos padronizados (`size="sm" | "md" | "lg" | "xl" | "full"`).
  * O backdrop, fechamento por `Escape`, foco e scroll interno de formulários já estão integrados.

### Camada 3: Painéis Auxiliares Grandes (`src/components/ui/sheet.tsx`)
* **O que pertence aqui:**
  * Assistente de IA / Copiloto Executivo e Técnico de controle de pragas.
  * Históricos extensos de auditoria, eventos de barramento corporativo e telemetria.
  * Painel de ajuda contextual, guias de aplicação química ou bulas de produtos.
  * Árvore de navegação e múltiplos filtros combinados de alta densidade.
* **Regra Inviolável:**
  * **NUNCA** renderizar painéis laterais pesados inline na página principal por padrão, ocupando espaço da listagem.
  * Devem ser sempre acionados por um botão ou ícone na barra superior ou na tela (ex: botão flutuante ou ícone de robô para o Chat IA), deslizando da lateral (`side="right"` ou `side="left"`).

### Camada 4: Grupos de Conteúdo Relacionado Inline (`src/components/ui/collapsible-section.tsx`)
* **O que pertence aqui:**
  * Blocos secundários dentro de uma tela ou formulário longo que não justificam um modal ou sheet separado.
  * Exemplo 1: em uma calculadora, o bloco "Parâmetros de Deslocamento e Combustível" ou "Composição Detalhada de Encargos".
  * Exemplo 2: em uma tela de cadastro, a seção "Dados Fiscais e Faturamento" ou "Histórico de Retornos de Garantia".
  * Exemplo 3: listas de checklists secundários ou instruções de segurança do trabalho (EPIs).
* **Diretriz:**
  * Permite ao operador expandir apenas quando necessário, mantendo o formulário enxuto e reduzindo a carga cognitiva da tela.

---

## 3. Exemplos Práticos de Código

### Exemplo A: Criação / Edição com `Dialog`

```tsx
import { useState } from "react"
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function NovoClienteButton() {
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Lógica de persistência
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="size-4" />
        Novo Cliente
      </DialogTrigger>

      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
          <DialogDescription>
            Insira os dados cadastrais e de endereço para atendimento técnico.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos do formulário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Nome / Razão Social</label>
              <input type="text" className="w-full mt-1" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Telefone / WhatsApp</label>
              <input type="text" className="w-full mt-1" required />
            </div>
          </div>

          <DialogFooter showCloseButton>
            <Button type="submit">Salvar Cliente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

---

### Exemplo B: Painel Auxiliar Grande com `Sheet`

```tsx
import { useState } from "react"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Bot, History } from "lucide-react"

export function CopilotoLateralSheet() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
        <Bot className="size-4 text-[#1B3A2D]" />
        Copiloto de Campo
      </SheetTrigger>

      <SheetContent side="right" className="sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Copiloto Técnico & Histórico</SheetTitle>
          <SheetDescription>
            Consulte recomendações de dosagem, pragas-alvo e histórico do cliente.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Conversação de IA ou Linha do Tempo */}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
```

---

### Exemplo C: Seção Secundária com `CollapsibleSection`

```tsx
import { CollapsibleSection } from "@/components/ui/collapsible-section"
import { Wrench, DollarSign } from "lucide-react"

export function DetalhesCustosAdicionais() {
  return (
    <CollapsibleSection
      title="Custos Adicionais e Parâmetros Especiais"
      description="Equipamentos locados, deslocamento extra e taxas de descarte químico"
      icon={Wrench}
      badge="Opcional"
      defaultOpen={false}
      variant="card"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div>
          <label className="text-xs font-semibold text-slate-700">Taxa de Deslocamento (R$)</label>
          <input type="number" className="w-full mt-1" defaultValue={0} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700">Locação de Termonebulizador</label>
          <input type="number" className="w-full mt-1" defaultValue={0} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700">Adicional Noturno (%)</label>
          <input type="number" className="w-full mt-1" defaultValue={0} />
        </div>
      </div>
    </CollapsibleSection>
  )
}
```

---

## 4. Props do Componente `CollapsibleSection`

| Propriedade | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `title` | `React.ReactNode` | *(obrigatório)* | Título exibido no cabeçalho. |
| `description` | `React.ReactNode` | `undefined` | Subtítulo explicativo abaixo do título. |
| `icon` | `LucideIcon \| ReactNode` | `undefined` | Ícone renderizado à esquerda do título. |
| `badge` | `React.ReactNode` | `undefined` | Tag ou número exibido ao lado do título (ex: contagem de itens). |
| `headerActions`| `React.ReactNode` | `undefined` | Botões extras no cabeçalho que não disparam o toggle. |
| `open` / `isOpen` | `boolean` | `undefined` | Estado aberto/fechado controlado. |
| `defaultOpen` | `boolean` | `true` | Estado inicial quando não controlado. |
| `onOpenChange`| `(open: boolean) => void` | `undefined` | Callback disparado na alternância do estado. |
| `variant` | `'card' \| 'bordered' \| 'ghost'`| `'card'` | Estilo visual de contêiner. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Escala de espaçamento e tipografia. |
| `keepMounted` | `boolean` | `false` | Se `true`, preserva o DOM oculto ao recolher (útil para formulários). |
| `disabled` | `boolean` | `false` | Se desativa a interação do cabeçalho. |
| `children` | `React.ReactNode` | *(obrigatório)* | Conteúdo interno da seção recolhível. |

---

## 5. Regras de Não-Regressão e Boas Práticas

1. **Multi-tenant Safe:** Os componentes visuais não devem armazenar ou vazar identificadores de tenant ou estado global fora de hooks autenticados (`useAuth`).
2. **Acessibilidade:** Todos os botões de disparo de Dialog, Sheet e Collapsible possuem `aria-expanded`, `aria-controls`, `tabIndex` e foco geridos automaticamente pela biblioteca base.
3. **Sem Modais Inline Fragmentados:** Nas próximas refatorações de módulos (`src/modules/*`), quaisquer `<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">` devem ser gradualmente convertidos para `Dialog` ou `Sheet`.
4. **Isolamento Modular:** Nenhuma regra de negócio, chamada ao Firestore ou cálculo analítico deve ser alterada durante a troca da casca de apresentação visual.
