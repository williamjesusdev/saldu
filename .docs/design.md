# Design System — Saldu

**Escopo:** este documento define a identidade visual e o sistema de componentes do **Saldu**. Cobre apenas telas do MVP (contas, cartões/faturas, lançamentos, transferências, categorias) — telas de referência com orçamento e assistente de IA foram usadas como inspiração de padrão, não de escopo (ver `PRD.md`).

---

## 1. Princípio de marca

O produto existe para uma dor específica: planilhas não escalam e não inspiram confiança sobre se o saldo está certo. A marca não vende excitação (ao contrário de fintechs consumer com cores vibrantes tipo cartão gamificado) — vende **precisão e calma**. A pessoa deve olhar pra tela e sentir "isso está certo", não "isso é bonito".

**Elemento assinatura:** toda linha de dado financeiro (transação, conta, fatura) carrega uma borda esquerda de 3px que comunica o estado de efetivação:
- Sólida, cor de estado (verde/vermelho) → `settledAt` preenchido, dado confirmado
- Tracejada, cor neutra → pendente, ainda não efetivado

Isso não é decoração — é o invariante de domínio mais importante do PRD (seção 8) tornado visível na interface, sem precisar de texto explicativo.

---

## 2. Cor

Paleta deliberada, não o azul-genérico #3B82F6 que aparece em toda referência SaaS. Uso de **azul-índigo profundo** como acento primário — recall visual de "tinta de caneta em documento oficial", coerente com o tom de "registro financeiro confiável".

### Tema claro

| Token | Valor | Uso |
|---|---|---|
| `--bg-canvas` | `#F6F7F9` | Fundo da página |
| `--bg-surface` | `#FFFFFF` | Cards, painéis |
| `--bg-surface-sunken` | `#EEF0F3` | Zebra de tabela, áreas inset |
| `--border-subtle` | `#E4E7EC` | Divisores, bordas de card |
| `--text-primary` | `#12161C` | Texto principal (quase-preto) |
| `--text-secondary` | `#5B6472` | Texto de apoio, labels |
| `--accent-primary` | `#2547D0` | Ações primárias, links, nav ativo |
| `--accent-primary-hover` | `#1D39A8` | Hover de ações primárias |
| `--positive` | `#12805C` | Saldo positivo, receita, fatura paga |
| `--negative` | `#C23B3B` | Saldo negativo, despesa, alerta |
| `--pending` | `#8A8F98` | Lançamento não efetivado (borda tracejada) |
| `--warning` | `#B8791A` | Reservado para orçamento/alertas (fase futura) |

### Tema escuro

| Token | Valor | Uso |
|---|---|---|
| `--bg-canvas` | `#0E1116` | Fundo da página |
| `--bg-surface` | `#161B22` | Cards, painéis |
| `--bg-surface-sunken` | `#1D232C` | Zebra de tabela |
| `--border-subtle` | `#2A313C` | Divisores |
| `--text-primary` | `#E7EAEE` | Texto principal |
| `--text-secondary` | `#9099A6` | Texto de apoio |
| `--accent-primary` | `#6C86F5` | Ações primárias |
| `--accent-primary-hover` | `#8A9FF8` | Hover |
| `--positive` | `#3ECF8E` | Saldo positivo |
| `--negative` | `#F27272` | Saldo negativo |
| `--pending` | `#6B7280` | Lançamento pendente |
| `--warning` | `#E8A94B` | Fase futura |

### Paleta de categorias (8 matizes, dessaturadas de propósito)

Diferente das referências (cores vivas tipo ícone de app mobile), aqui as cores de categoria são deliberadamente contidas — servem pra escaneabilidade, não pra decoração.

`teal #2D8577` · `âmbar #B8791A` · `coral #C25B42` · `violeta #6B5CA5` · `azul-céu #3B7EA1` · `oliva #7A8450` · `ameixa #8A4F73` · `slate #5B6472`

Cada categoria recebe uma cor fixa desse conjunto (round-robin na criação), consistente entre light/dark (mesma matiz, luminosidade ajustada automaticamente).

---

## 3. Tipografia

Escolha deliberada: **Public Sans** para UI/texto corrido (humanista, limpa, incomum em fintech — foge do Inter-em-tudo genérico) + **Spline Sans Mono** para todo valor monetário e numérico.

Todo número na aplicação — saldo, valor de transação, percentual de utilização de fatura — renderiza em monoespaçada com tabular figures. Isso não é só estética: colunas de valores alinham perfeitamente, o que importa muito numa tabela de extrato.

| Papel | Fonte | Peso | Tamanho |
|---|---|---|---|
| Título de tela | Public Sans | 600 | 20px |
| Título de card | Public Sans | 600 | 15px |
| Corpo/label | Public Sans | 400 | 13–14px |
| **Valor monetário (destaque)** | **Spline Sans Mono** | 500 | 24px |
| **Valor monetário (tabela)** | **Spline Sans Mono** | 400 | 13px |
| Legenda/metadado | Public Sans | 400 | 12px |

---

## 4. Layout e espaçamento

- Navegação lateral: rail de ícones, 64px de largura, fixo
- Escala de espaçamento: 4 / 8 / 12 / 16 / 24 / 32 / 48px
- Raio de borda: 6px (controles pequenos) / 10px (inputs, pills) / 14px (cards) — deliberadamente menos arredondado que as referências (pill quase circular), buscando uma sensação mais "instrumento de precisão" que "app consumer"
- Cards: fundo `--bg-surface`, borda 1px `--border-subtle`, sem sombra pesada (sombra sutil opcional, `0 1px 2px rgba(0,0,0,0.04)`)

---

## 5. Componentes-chave

### Pill de status (fatura)
Três estados, cores semânticas fixas:
- `Aberta` — fundo `--accent-primary` 10% opacidade, texto `--accent-primary`
- `Fechada` — fundo neutro, texto `--text-secondary`
- `Paga` — fundo `--positive` 10% opacidade, texto `--positive`, com botão "Reabrir fatura" (ghost, secundário) ao lado — nunca ação destrutiva-looking, é uma ação de correção legítima

### Linha de tabela com borda de estado (elemento assinatura)
```
┌┃ Aluguel                    -R$ 1.200,00   Efetivado
┊┊ Assinatura streaming          -R$ 39,90   Pendente (vence 10/07)
```
(┃ = borda sólida verde/vermelha, ┊ = borda tracejada cinza)

### Cartão de KPI
Label pequeno (12px, `--text-secondary`) acima, valor grande em Spline Sans Mono abaixo. Sem ícone decorativo — o número é o herói.

### Avatar circular de categoria/conta
32px, cor de fundo da categoria, ícone Tabler outline centralizado, cor de ícone = tom mais escuro da mesma matiz (nunca branco puro sobre cor saturada).

### Seletor de tenant/perfil (multiusuário)
Dropdown no canto superior direito, refletindo diretamente nossa arquitetura de `tenant_id` de primeira classe.

---

## 6. Acessibilidade

- Contraste mínimo AA (4.5:1) para todo texto, validado nos dois temas
- Foco de teclado visível (anel de foco usando `--accent-primary`, nunca removido)
- A borda de estado (assinatura) nunca é o único indicador de status — sempre acompanhada de texto ("Efetivado"/"Pendente") para quem usa leitor de tela ou tem daltonismo
- `prefers-color-scheme` respeitado por padrão; toggle manual disponível nas configurações

---

## 7. Inventário de telas do MVP

Mapeamento contra os requisitos funcionais do PRD (seção 5).

| Requisito PRD | Tela/fluxo | Prompt |
|---|---|---|
| Autenticação, convite (itens 1, 13) | Login, aceite de convite, gestão de convites | Prompt 5 |
| Contas (item 2) | Lista de contas | Coberta no mockup; reaproveita `LedgerRow` |
| Reajuste de saldo (item 8) | Formulário com motivo obrigatório | Prompt 6 |
| Cartões (item 3) | Lista + criar/editar | Prompt 3 (card) + formulário próprio (reaproveita padrão de formulário do Prompt 7) |
| Lançamento em conta (item 4) | Formulário com 3 datas + valor negativo | Prompt 7 |
| Lançamento em cartão parcelado (item 5) | Formulário com parcelamento | Prompt 7 (variante) |
| Transferência (item 6) | Formulário + confirmação + auditoria | Prompt 8 |
| Categorias/subcategorias (item 7) | CRUD | Prompt 9 |
| Fatura paga/reaberta (item 12) | Detalhe de fatura, lista de lançamentos, ação reabrir | Prompt 10 |
| Tela consolidada (item 10) | Dashboard | Demonstrado no mockup interativo |
| Estados vazios | Sem conta, sem lançamento, sem cartão | Prompt 11 |

## 8. Prompts de delegação (Antigravity / Copilot / outros agentes)

Use estes prompts dentro do fluxo do Spec Kit (`/speckit.specify` ou como contexto de implementação), um por componente. Cada um assume que o agente já tem acesso a este `design.md` e ao `constitution.md` do projeto.

### Prompt 1 — Design tokens (Tailwind config)
```
Implemente os design tokens do design.md como CSS custom properties e configuração
Tailwind, com suporte a tema claro/escuro via atributo `data-theme` no elemento raiz
(não use prefers-color-scheme como única fonte — precisa de toggle manual persistido).

Requisitos:
- Todas as cores da seção 2 do design.md como variáveis CSS
- Fontes Public Sans (UI) e Spline Sans Mono (valores monetários) via next/font
- Nenhuma cor hardcoded fora do arquivo de tokens — todo componente consome via
  classe Tailwind mapeada às variáveis (ex: bg-canvas, text-primary, accent-primary)
```

### Prompt 2 — Componente de linha de tabela com estado (elemento assinatura)
```
Crie um componente React `LedgerRow` que renderiza uma linha de transação com borda
esquerda de 3px indicando estado de efetivação:
- settledAt preenchido → borda sólida, cor positiva (receita) ou negativa (despesa)
- settledAt nulo → borda tracejada, cor --pending, com texto "Pendente" e a due date

O valor monetário usa a fonte Spline Sans Mono, alinhado à direita, com sinal e cor
(verde para positivo, vermelho para negativo). Nunca remova o texto de status mesmo
com a borda visível — é requisito de acessibilidade (design.md seção 6).

Escreva o teste de componente antes da implementação (TDD): casos para efetivado
positivo, efetivado negativo, e pendente.
```

### Prompt 3 — Card de fatura com pill de status
```
Crie o componente `InvoiceCard` seguindo o padrão visual do design.md seção 5:
- Header com ícone do cartão, nome, e pill de status (Aberta/Fechada/Paga)
- Barra de progresso de limite utilizado
- Se status = Paga, exibir botão secundário "Reabrir fatura" — ao clicar, chama a
  API que remove o lançamento de pagamento associado (ver PRD seção 5, item 12)
  e exige confirmação explícita antes de executar (ação não é reversível sem novo
  pagamento)
```

### Prompt 4 — Tema claro/escuro (toggle)
```
Implemente o toggle de tema (claro/escuro/sistema) persistido em localStorage,
aplicando o atributo data-theme no elemento <html> antes da hidratação (evitar
flash de tema errado). Todos os componentes já criados devem funcionar sem
alteração, pois consomem apenas variáveis CSS — valide isso explicitamente
alternando o tema e verificando contraste AA nos dois modos.
```

### Prompt 5 — Login, convite e gestão de acesso
```
Crie três telas de autenticação seguindo o design.md:
1. Login (e-mail/senha) — formulário simples, mensagem de erro específica
   ("E-mail ou senha incorretos", nunca "Erro de autenticação")
2. Aceite de convite — acessível via link com token, mostra o e-mail já
   preenchido (vindo do convite) e pede apenas a criação de senha
3. Painel de convites (admin) — lista de solicitações de cadastro aberto
   pendentes de aceite, com ação aprovar/recusar, e um botão "Gerar convite"
   que cria um token e mostra o link para compartilhar manualmente

Não implemente cadastro aberto sem aprovação — todo acesso passa por um dos
três mecanismos do PRD (seção 5, item 13). Escreva testes de componente antes
da implementação para o formulário de login (TDD).
```

### Prompt 6 — Reajuste de saldo manual
```
Crie o componente `BalanceAdjustmentForm`: campo de novo saldo, campo de motivo
(obrigatório, mínimo 5 caracteres, sem isso o botão de salvar fica desabilitado
com uma dica visível do porquê — nunca apenas desabilitado sem explicação).
Ao confirmar, mostra a diferença calculada entre saldo anterior e novo saldo
antes do usuário confirmar definitivamente (ex: "Isso vai registrar um ajuste
de -R$ 45,30. Confirmar?"). Essa é uma ação que altera saldo sem lançamento
normal, então a confirmação explícita é obrigatória, não opcional.
```

### Prompt 7 — Formulário de lançamento (conta e cartão)
```
Crie o componente `TransactionForm`, usado tanto para lançamentos em conta
quanto em cartão (mesma base, com um switch de contexto):

Campos comuns: descrição, valor (aceita negativo para reembolso/estorno,
ver design.md seção "elemento assinatura" para exibição), categoria/subcategoria
(combobox com busca), data de lançamento, data de vencimento, data de
efetivação (opcional — se vazia, o lançamento fica "Pendente").

Campo exclusivo de cartão: número de parcelas (1 a 24), com preview do valor
de cada parcela calculado em tempo real.

Regras de validação:
- valor não pode ser zero
- data de efetivação não pode ser anterior à data de lançamento
- se fatura do cartão selecionado estiver "Paga", bloquear o lançamento e
  mostrar a opção "Reabrir fatura primeiro" (não deixe o usuário preso sem
  saída)

Escreva os testes de validação antes da implementação (TDD) — esses são os
invariantes de domínio mais importantes do PRD.
```

### Prompt 8 — Transferência entre contas
```
Crie o fluxo `TransferForm`: conta de origem, conta de destino (não pode ser
igual à origem), valor, data. Ao confirmar, o fluxo deve:
1. Mostrar uma tela de confirmação clara ("Transferir R$ X de [origem] para
   [destino] em [data]") antes de executar
2. Chamar a API de transferência, que — no backend — registra em uma tabela
   própria de transferências com status de processo antes de gerar os dois
   lançamentos (ver PRD seção 8, conceito Transfer)
3. Se a API retornar falha parcial, exibir claramente que a transferência
   não foi concluída e orientar a tentar novamente — nunca mostrar como
   sucesso uma transferência que ficou em estado intermediário
```

### Prompt 9 — Gestão de categorias e subcategorias
```
Crie a tela de CRUD de categorias: lista com cor (das 8 matizes do design.md
seção 2), nome, e subcategorias aninhadas (expansível). Ações: criar, editar,
excluir. Ao excluir uma categoria com lançamentos associados, bloquear a
exclusão e explicar quantos lançamentos estão vinculados, oferecendo
"mover lançamentos para outra categoria" como alternativa — nunca excluir
em cascata silenciosamente.
```

### Prompt 10 — Detalhe de fatura
```
Crie a tela de detalhe de uma fatura específica: lista de lançamentos
(usando o componente LedgerRow do Prompt 2), total, e o pill de status
(Aberta/Fechada/Paga) do Prompt 3. Se status = Paga, todos os lançamentos
ficam somente leitura e um aviso no topo explica que é preciso reabrir a
fatura para editar (com o botão de ação ali mesmo, não escondido em menu).
```

### Prompt 11 — Estados vazios
```
Crie os três estados vazios do MVP: sem contas cadastradas, sem lançamentos
no período selecionado, sem cartões cadastrados. Cada um segue o padrão:
título nomeando o espaço ("Nenhuma conta ainda"), uma linha explicando,
e um botão de ação com verbo ("Criar conta"). Nunca apenas "Nada aqui" sem
próximo passo claro — para um beta de 5 pessoas, o primeiro uso real
acontece exatamente nesses estados vazios.
```