# Quickstart Validation Guide

Este guia descreve como um validador de QA pode testar a implementação após a fase de codificação.

## 1. Validando a Refatoração de UI (Zod & Componentes React)
1. Inicie apenas o módulo frontend localmente: `npm run dev --workspace=apps/web`
2. Acesse a rota `/login` e clique diretamente no botão de submit sem preencher dados.
3. *Resultado Esperado*: Mensagens de erro de validação do Zod (ex: "Email inválido") devem aparecer imediatamente na UI sem causar recarregamento da página ou requisições desnecessárias (Network tab vazia).

## 2. Validando a Proteção CSRF no Backend
1. Inicie o servidor da API: `./mvnw spring-boot:run`
2. Utilizando o Postman ou `cURL`, tente realizar um login forjado (`POST /api/v1/auth/login`) sem enviar o cabeçalho `X-XSRF-TOKEN`.
3. *Resultado Esperado*: A API deve barrar e retornar HTTP `403 Forbidden` informando violação CSRF.
4. Acesse o sistema via interface UI (Next.js) e tente realizar o login validamente.
5. *Resultado Esperado*: O Network Explorer (DevTools) deve demonstrar que o interceptor Axios/Fetch anexou o header `X-XSRF-TOKEN` e a requisição retornou sucesso (`200 OK`).

## 3. Rodando o Quality Gate Global (Saldu Constitution)
Para garantir que não ocorram quebras no resto do projeto (ex: Contas Bancárias):
1. Execute na raiz: `npm run quality-gate:ci`
2. *Resultado Esperado*: Testes Playwright (E2E), Jest e JUnit devem aprovar sem warnings pendentes no compilador.
