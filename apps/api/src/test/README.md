# Padrões de Testes do Backend (Spring Boot)

Este documento estabelece o padrão rigoroso e coeso de nomenclatura, estrutura e execução para todas as suítes de teste do Backend (Java) no Saldu, alinhando-se aos padrões já existentes no Frontend e E2E.

## 1. Padrão de Nomenclatura das Suítes (Classes)

Todo arquivo de teste deve ter o nome correspondente à classe principal que está sendo testada.
- **Testes Unitários:** O sufixo deve ser obrigatoriamente `Test`.
  - Exemplo: `AuthServiceTest.java` (testando `AuthService`).
- **Testes de Integração:** O sufixo deve ser obrigatoriamente `IntegrationTest`.
  - Exemplo: `AuthLoginIntegrationTest.java`.

## 2. Nomenclatura dos Métodos (`@Test`)

O nome do método de teste deve ser claro e refletir o cenário e comportamento usando o padrão genérico: `[methodName]_[Condition]_[Result]` (ex: `login_ValidCredentials_ReturnsToken`) ou `[methodName]_[Condition]` (ex: `login_UserNotFound_ThrowsException`).

### Uso de `@DisplayName` (Obrigatório)
Além do nome do método, **todos os testes** devem utilizar a anotação `@DisplayName` descrevendo a regra de negócio em **Inglês**.
- Formato recomendado: `Should [expected behavior] when [state/condition]`.
- Exemplo: `@DisplayName("Should return a valid JWT token when credentials are correct")`

## 3. Anatomia de Mocks e Estrutura do Teste (AAA)

Os testes devem seguir visualmente o padrão **Arrange** (Preparar), **Act** (Agir), **Assert** (Verificar).
- **Sem Comentários Explícitos (No comments)**: Para evitar poluição visual, separe as fases do AAA usando apenas **linhas em branco**, e evite ou remova comentários literais como `// Arrange` ou outros comentários óbvios pelo código base.
- Utilize o `@ExtendWith(MockitoExtension.class)` para controle de mocks e injeção via `@InjectMocks`.

```java
@Test
@DisplayName("Should block request and return 429 when rate limit is exceeded")
void doFilterInternal_RateLimitExceeded() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/v1/auth/login");
    for (int i = 0; i < 5; i++) {
        rateLimitFilter.doFilterInternal(request, response, filterChain);
    }

    rateLimitFilter.doFilterInternal(request, response, filterChain);

    verify(response).setStatus(429);
}
```

## 4. Asserções e Validações de Erro

- Use sempre a biblioteca **AssertJ** (`assertThat(...)`) para obter asserções idiomáticas e encadeadas. Evite métodos soltos do JUnit como `assertEquals`.
- Para validar exceções lançadas, use o método `catchThrowable(() -> ...)` do AssertJ no lugar de `assertThrows`. Isso garante maior clareza no bloco Assert.

```java
@Test
@DisplayName("Should throw BusinessException when user is not found")
void login_UserNotFound_ThrowsException() {
    when(userRepository.findByEmailAndDeletedAtIsNull("test@example.com")).thenReturn(Optional.empty());

    Throwable thrown = catchThrowable(() -> authService.login("test@example.com", "password"));

    assertThat(thrown).isInstanceOf(BusinessException.class);
    assertThat(((BusinessException) thrown).getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
}
```
