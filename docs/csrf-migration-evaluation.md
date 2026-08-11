# Avaliação de Segurança: Migração CSRF e Autenticação via Cookies

## 1. Contexto Atual
Atualmente, o Saldu utiliza JWT (JSON Web Tokens) para autenticação. 
- No backend (`apps/api`), o `SecurityConfig.java` possui a proteção CSRF do Spring Security explicitamente desativada (`http.csrf(AbstractHttpConfigurer::disable)`).
- O `JwtService.java` extrai o token JWT diretamente a partir de cookies recebidos nas requisições.
- O `AuthController.java` injeta o token num cookie `HttpOnly` com a diretiva `SameSite=Lax`.

Essa configuração levanta alertas em ferramentas de análise estática como o SonarQube (Regra `java:S4502`), alertando sobre o risco de desativar o CSRF em um cenário onde credenciais ambientes (cookies) são utilizadas.

## 2. Mitigação Atual (Por que é seguro?)
Embora o Spring Security acuse o CSRF desativado, o Saldu encontra-se protegido contra ataques CSRF padrão nas rotas de API (POST/PUT/DELETE) graças à política **`SameSite=Lax`** no momento da criação do cookie de JWT.

A diretiva `SameSite=Lax` instrui o navegador a **nunca anexar o cookie** a requisições de origens cruzadas, a menos que seja uma navegação de nível superior (ex: clique em um link `<a>`). Logo, um ataque onde uma página maliciosa forja um POST em background (via formulários invisíveis ou requisições AJAX maliciosas) falhará porque o cookie de sessão do JWT não será acoplado pelo browser.

- **Ação Imediata:** A supressão do alerta do SonarQube usando `@SuppressWarnings("java:S4502")` é justificada e representa a opção pragmática de menor impacto para o atual estado do sistema, pois garante a mesma segurança via navegador sem causar quebras na integração do Frontend (Next.js).

## 3. Planos de Migração Futura
Para uma futura modernização da arquitetura visando conformidade 100% estrita e padronizada (onde auditorias não aceitem o *SameSite* como mitigação única), há duas rotas arquiteturais recomendadas:

### Rota A: Migrar para uso exclusivo do cabeçalho `Authorization: Bearer`
Neste modelo, o JWT não transita mais em nenhum cookie, tornando a aplicação imune e agnóstica a CSRF (visto que nenhum navegador injetará o Authorization Header nativamente). O CSRF pode permanecer oficialmente desativado.

* **Impacto no Backend:** **Baixo**. O `JwtService` e `AuthController` perderiam o tratamento e criação de `ResponseCookie`, operando a leitura puramente no header `Authorization`.
* **Impacto no Frontend (Next.js):** **Muito Alto**. 
  * O Next.js precisaria de uma grande arquitetura de sessão própria para persistir e trafegar esse token seguramente no cliente e re-hidratá-lo durante o SSR. O uso em *Server Components* e Actions precisaria de profunda refatoração.

### Rota B: Reativar a Proteção CSRF Nativa do Spring (Padrão OWASP)
Este modelo mantém o tráfego do JWT via cookies `HttpOnly` (facilitando o fluxo no Next.js Server-Side), mas restabelece a validação padrão de CSRF Tokens pelo Spring Security, removendo a ressalva do SonarQube.

* **Impacto no Backend:** **Médio**. O `SecurityConfig` deverá ser alterado para inicializar a proteção via `.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())`.
* **Impacto no Frontend:** **Médio**. 
  * A camada de chamadas HTTP (ex: Axios, Fetch ou instâncias RTK) precisará obrigatoriamente de interceptors globais que leiam o novo cookie `XSRF-TOKEN` gerado pelo servidor e reescrevam-no no header da requisição (`X-XSRF-TOKEN`) ao realizar mutações (POST/PUT/DELETE/PATCH).

## 4. Veredito Recomendado para Migração
Caso o projeto decida evoluir a segurança da camada de autenticação, a recomendação oficial de migração será seguir a **Rota B**. 

A **Rota B** adota a filosofia de *Defense in Depth* preconizada pela OWASP. Ela permite satisfazer as exigências de análise estática e mantém a infraestrutura conveniente baseada em Cookies de Sessão que o framework Next.js consome com grande eficiência no App Router.
