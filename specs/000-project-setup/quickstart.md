# Guia de Validação Rápida: Perfis e Ambientes

## Cenário 1: Start Padrão (Local)
1. Rodar `docker-compose up -d` na raiz do projeto.
2. Rodar `./mvnw spring-boot:run` na pasta `backend/`.
   - **Resultado**: O console deve exibir `The following 1 profile is active: "dev"`. A aplicação conecta ao banco no localhost:5432.
3. Rodar `npm run dev` na pasta `frontend/`.
   - **Resultado**: O console Next.js informa que as variáveis foram carregadas do `.env.development`.

## Cenário 2: Override com dev.local (Backend)
1. Criar um arquivo `backend/src/main/resources/application-dev.local.yml`.
2. Adicionar nele configurações customizadas, por exemplo:
   ```yaml
   server:
     port: 8081
   ```
3. Rodar `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev,dev.local`.
   - **Resultado**: A API sobe na porta 8081. O comando `git status` NÃO deve listar o arquivo `application-dev.local.yml` como untracked (já que ele estará no `.gitignore`).

## Cenário 3: Validação Fail-Fast (Produção)
1. Rodar `./mvnw spring-boot:run -Dspring-boot.run.profiles=prd`.
   - **Resultado**: A aplicação DEVE quebrar o build ou estourar erro imediato informando que placeholders como `${DB_URL}` não puderam ser resolvidos. Nenhuma senha hardcoded deve ter vazado.
