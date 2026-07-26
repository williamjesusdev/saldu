# Research: Autenticação e Gestão de Acesso

## Decision: JWT with HttpOnly Cookie (or Secure Storage + short expiration)
**Rationale**: A especificação exige o uso de JWT e a manutenção da sessão de forma segura.
**Alternatives considered**: Basic Auth (inseguro para SPA), Stateful sessions (não escala bem).

## Decision: Argon2 for password hashing
**Rationale**: Padrão da indústria, recomendado para aplicações modernas. A especificação permite Argon2 e BCrypt.
**Alternatives considered**: BCrypt.

## Decision: Custom Spring Security Filter for Rate Limiting
**Rationale**: A especificação exige explicitamente um algoritmo de janela deslizante (sliding window, 5 requisições/min) para os endpoints.
**Alternatives considered**: Redis/Bucket4j (rejeitado inicialmente pois não queremos adicionar o Redis à stack tecnológica do MVP).

## Decision: Centralized AuditService (stdout/SLF4J for MVP)
**Rationale**: O FR-012 exige um AuditService extensível inicialmente realizando log em stdout.
**Alternatives considered**: Inserção direta no banco de dados para os logs de auditoria (rejeitado no MVP para poupar complexidade).
