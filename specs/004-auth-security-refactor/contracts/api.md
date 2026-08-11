# API Security Contract (CSRF)

## Global Mutation Contract
Todas as requisições que alteram estado na plataforma (`POST`, `PUT`, `DELETE`, `PATCH`) sob as rotas da API `/api/v1/*` passam a exigir dupla verificação pelo middleware de segurança.

**Header Requerido**: `X-XSRF-TOKEN`
**Origem Esperada do Valor**: O client (frontend) deve extrair este valor dinamicamente do cookie (não-HttpOnly) `XSRF-TOKEN` emitido inicialmente pelo servidor.

**Comportamento da Resposta (Response Status)**:
- **Sucesso (`2xx`)**: Validação aprovada, header validado contra o repositório em memória/sessão atrelada.
- **Falha (`403 Forbidden`)**: Rejeição por "Invalid CSRF Token" ou "Missing CSRF Token" caso o cabeçalho não venha, venha vazio ou modificado.
