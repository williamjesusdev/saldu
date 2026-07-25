# Design System — Saldu

**Data:** Julho/2026
**Versão:** 1.0 (baseline)
**Dono do produto:** William Jesus
**Escopo:** este documento define a identidade visual e o sistema de componentes do **Saldu**, focando em uma estética "Dark Mode" moderna, premium e vibrante, mas preservando o rigor técnico da exibição de dados financeiros.

---

## 1. Princípio de marca e UI Patterns

O design deve gerar um efeito "Uau", desviando das cores genéricas em favor de gradientes sutis, glassmorphism controlado (`backdrop-blur-md`), e micro-animações responsivas (`transition-all duration-200` em hovers, `active:scale-95`).

**Elemento assinatura:** toda linha de dado financeiro (transação, conta) carrega uma borda esquerda de 3px que comunica o estado de efetivação:
- Sólida, cor de estado (verde/vermelho) → `settledAt` preenchido, transação efetivada.
- Tracejada, cor neutra → pendente, ainda não efetivada.

Isso garante que o invariante de domínio mais importante (o saldo só considera o que está efetivado) fique visualmente claro sem textos excessivos.

---

## 2. Paleta de Cores (Design Tokens - Tailwind)

A paleta prioriza fundos escuros e interfaces em "camadas" usando tons sutis de cinza/preto, com cores de destaque vibrantes. Ambos os temas (Claro/Escuro) são suportados.

### Tema Escuro (Principal)
| Token | Valor | Uso |
|---|---|---|
| `--bg-canvas` | `#09090b` | Fundo da página (Quase preto) |
| `--bg-surface` | `#18181b` | Cards, painéis |
| `--bg-surface-elevated` | `#27272a` | Popovers e modais (glassmorphism) |
| `--border-subtle` | `#2A313C` | Divisores sutis |
| `--text-primary` | `#fafafa` | Texto principal |
| `--text-secondary` | `#a1a1aa` | Texto de apoio |
| `--accent-primary` | `#8b5cf6` | Roxo Premium (Ações primárias) |
| `--positive` | `#10b981` | Saldo positivo, receita (Esmeralda) |
| `--negative` | `#f43f5e` | Saldo negativo, despesa (Rosa/Vermelho) |
| `--pending` | `#6B7280` | Lançamento não efetivado |
| `--warning` | `#f59e0b` | Alertas |

### Tema Claro
| Token | Valor | Uso |
|---|---|---|
| `--bg-canvas` | `#F6F7F9` | Fundo da página |
| `--bg-surface` | `#FFFFFF` | Cards, painéis |
| `--bg-surface-elevated` | `#EEF0F3` | Popovers |
| `--border-subtle` | `#E4E7EC` | Divisores sutis |
| `--text-primary` | `#12161C` | Texto principal |
| `--text-secondary` | `#5B6472` | Texto de apoio |
| `--accent-primary` | `#7c3aed` | Roxo Escuro (Ações primárias) |
| `--positive` | `#059669` | Esmeralda Escuro |
| `--negative` | `#e11d48` | Rosa/Vermelho Escuro |
| `--pending` | `#8A8F98` | Lançamento não efetivado |
| `--warning` | `#d97706` | Alertas |

---

## 3. Tipografia

- **Fonte Primária (UI, Títulos):** `Inter` — excelente legibilidade em UI.
- **Fonte Secundária (Valores Financeiros):** `Spline Sans Mono` — obrigatória para todo valor monetário. Usar *tabular figures* garante que colunas de valores alinhem perfeitamente em extratos.

| Papel | Fonte | Peso | Tamanho |
|---|---|---|---|
| Título de tela | Inter | 600 | 20px |
| Título de card | Inter | 600 | 15px |
| Corpo/label | Inter | 400 | 13–14px |
| **Valor monetário (destaque)** | **Spline Sans Mono** | 500 | 24px |
| **Valor monetário (tabela)** | **Spline Sans Mono** | 400 | 13px |

---

## 4. Prompts de Delegação (Time de Especialistas / saldu-architect)

Use estes prompts como contexto de implementação para a equipe de agentes gerar os componentes Next.js/Tailwind.

### Prompt 1 — Design tokens e Temas
```
Implemente os design tokens do design.md como CSS custom properties e configuração
Tailwind. Suporte a tema claro/escuro via atributo `data-theme` no <html> persistido.
Fontes Inter e Spline Sans Mono via next/font. Nenhuma cor hardcoded nos componentes.
```

### Prompt 2 — Componente de Linha (LedgerRow)
```
Crie um `LedgerRow` renderizando a borda esquerda de 3px (Elemento Assinatura):
- settledAt preenchido → sólida, cor positiva/negativa dependendo do tipo (INCOME/EXPENSE).
- settledAt nulo → tracejada, cor --pending.
Valor monetário em Spline Sans Mono. Acessibilidade: inclua SR-only text para o estado.
```

### Prompt 3 — Card de Fatura (Computed States)
```
Crie `InvoiceCard`. Faturas não têm status físico, mostre a pill de status baseada nas datas:
- OPEN (paidAt nulo, data atual < closingDate): Fundo accent, texto accent.
- CLOSED (paidAt nulo, data atual >= closingDate): Fundo neutro, texto secundário. Em fechada, edições exigem confirmação explícita.
- OVERDUE (paidAt nulo, data atual > dueDate): Fundo warning, texto warning.
- PAID (paidAt preenchido): Fundo positive, botão secundário "Estornar Pagamento".
```

### Prompt 4 — Login e Convites
```
Crie Login e Gestão de Convites. O sistema não tem cadastro aberto livre. Acesso apenas via token ou aprovação de admin (seção 5, PRD).
```

### Prompt 5 — Formulário de Transação (Lançamentos e Estornos)
```
Crie `TransactionForm`. Campos: descrição, valor (positivo/absoluto), tipo (INCOME/EXPENSE), categoria, dates (lançamento, vencimento, efetivação).
Regras estritas (Linguagem Ubíqua):
- O valor monetário digitado no input nunca é negativo.
- Para registrar um Estorno/Reembolso, o usuário cadastra uma Transação do tipo INCOME e seleciona a transação original no campo `refundForId`.
Se efetivação for nula, é pendente.
```

### Prompt 6 — Transferência
```
Crie `TransferForm` (origem, destino, valor, data).
Chama API que cria a `Transfer` (status pending) e atrela as duas transações (uma EXPENSE e uma INCOME). Sem estorno automático em caso de falha de banco.
```

### Prompt 7 — Gestão de Categorias
```
CRUD de categorias. 2 níveis (parentId). Cores pastel automáticas. Categorias de sistema (id nulo ou flag) não podem ser excluídas nem editadas. Exclusão exige realocação de transações filhas.
```

### Prompt 8 — Estados Vazios
```
Crie "Empty States" para ausência de contas e transações. Textos convidativos e botão de Call-to-Action claro, aplicando glassmorphism no card.
```
