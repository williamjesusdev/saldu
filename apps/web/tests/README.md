# Padrões de Testes do Frontend

Este documento estabelece o padrão rigoroso e coeso de nomenclatura, estrutura e ordem de execução para todas as suítes de teste do Frontend (Vitest + React Testing Library) no Saldu.

## 1. Padrão de Nomenclatura das Suítes (`describe`)

Todo componente ou página deve encapsular seus testes em um `describe` contendo o nome exato do arquivo mais o sufixo apropriado.

- **Componentes/Páginas:** `describe('[NomeDoComponente] Component', () => { ... })`
  - Exemplo: `describe('RegisterPage Component', () => { ... })`
- **Bibliotecas/Hooks:** `describe('[Nome] Library/Hook', () => { ... })`
  - Exemplo: `describe('apiClient Library', () => { ... })`

## 2. Ordem dos Testes e Padrão de Nomenclatura (`it`)

A ordem dos blocos `it` dentro de um `describe` deve seguir rigorosamente a sequência lógica abaixo, simulando a jornada do usuário. Todas as strings devem estar em **Inglês**.

1. **Renderização Inicial e Estado Visual (`renders...`)**:
   - `it('renders [component name] correctly', ...)`
   - Testa a presença de botões, placeholders, textos vitais e estado desabilitado inicial.
2. **Validação no Cliente (`prevents...` ou `validates...`)**:
   - `it('prevents submission if required fields are empty', ...)`
   - Testa comportamento síncrono antes de invocar a API (ex: campos required).
3. **Estados Transicionais (`displays...`)**:
   - `it('displays loading state during submission', ...)`
   - Testa os indicadores de loading na tela.
4. **Caminhos Felizes (`handles successful...`)**:
   - `it('handles successful [action]', ...)` ou `it('handles successful [action] and redirects', ...)`
   - Testa o retorno `ok: true` da API, assertindo roteamentos ou exibições de sucesso.
5. **Erros de API / Backend (`handles API error...`)**:
   - `it('handles API error gracefully', ...)`
   - Testa retornos da API que contém `ok: false` (Status 4xx ou 5xx) simulando erros de negócio ou validação.
6. **Erros de Infraestrutura/Rede (`handles network error...`)**:
   - `it('handles network error gracefully', ...)`
   - Testa rejeições abruptas como `fetch` lançando um `new Error()`.

## 3. Anatomia de Mocks (AAA)

Todo arquivo deve possuir a estrutura padrão de limpeza global no `beforeEach` e `afterEach`:

```typescript
describe('MyComponent Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    // Mocks adicionais: useRouter, etc
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // it() tests go here...
});
```
