# Quickstart: Bank Accounts Validation

## Prerequisites
- Sistema Saldu em execução (API, Web, DB).
- Usuário de teste já cadastrado e logado.

## Validation Scenarios

### Scenario 1: Criar Conta e Listar
1. Acesse o front-end em `http://localhost:3000`
2. Faça login.
3. Navegue até `/accounts` (Contas).
4. Clique em "Nova Conta".
5. Preencha:
   - Nome: `Bradesco`
   - Tipo: `CHECKING`
   - Saldo Inicial: `500.00`
6. Envie o formulário.
7. **Expected Outcome**: A conta aparece na lista com saldo `500.00`.

### Scenario 2: Arquivar Conta
1. Na lista de contas (em `/accounts`), localize a conta criada.
2. Clique no botão de editar/opções e escolha "Arquivar" (ou Excluir).
3. Confirme a ação.
4. **Expected Outcome**: A conta desaparece da lista. No banco de dados, verifique que `deleted_at` está preenchido e que a conta AINDA existe na tabela.
