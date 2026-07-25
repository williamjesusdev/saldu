# DDD Pragmático — Saldu

**Guia de aplicação DDD simplificado para o backend do projeto (Spring Boot).**

---

## 1. Princípio

DDD completo (event sourcing, CQRS) é overkill para um MVP. Mas **modelos anêmicos** (entidades como sacolas de dados + services que fazem tudo) são um problema real, levando a lógica duplicada e código frágil.

A abordagem aqui é **DDD pragmático**: usar os tactical patterns essenciais para criar **modelos ricos** onde a lógica de negócio vive onde deveria viver — nas entidades.

---

## 2. Patterns Adotados

### Entidades com Comportamento (Modelos Ricos)

As entidades gerenciam seu próprio estado e garantem seus invariantes. Por exemplo, a Fatura (`Invoice`) não possui uma coluna física de `status`, ela calcula seu estado dinamicamente baseada no tempo, eliminando a necessidade de *cron jobs*.

```java
// ✅ Modelo Rico (FAZER) - Estado Computado e Comportamento
public class Invoice {
    private LocalDate closingDate;
    private LocalDate dueDate;
    private LocalDateTime paidAt;
    
    // O Status é puramente derivado, nunca persistido
    public InvoiceStatus getStatus(LocalDate currentDate) {
        if (this.paidAt != null) return InvoiceStatus.PAID;
        if (currentDate.isAfter(this.dueDate)) return InvoiceStatus.OVERDUE;
        if (currentDate.isBefore(this.closingDate)) return InvoiceStatus.OPEN;
        return InvoiceStatus.CLOSED;
    }
    
    public void markAsPaid(LocalDateTime paymentTime) {
        if (this.paidAt != null) {
            throw new BusinessException("A fatura já está paga");
        }
        this.paidAt = paymentTime;
    }

    public void reopen() {
        if (this.paidAt == null) {
            throw new BusinessException("Apenas faturas pagas podem ser reabertas");
        }
        this.paidAt = null; // Remove o pagamento associado
    }
}
```

### Factory para Criação de Agregados

Toda criação de entidade raiz (Aggregate Root) passa por classes `Factory`. Nunca use `new` ou `builder()` diretamente nos Controllers ou Services.

```java
// domain/user/factory/UserFactory.java
@Component
public class UserFactory {

    private final PasswordEncoder passwordEncoder;

    public UserFactory(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    // Criação de usuário base (Beta Tester) via convite
    public User createFromInvite(String email, String rawPassword, UUID subscriptionId) {
        String hash = passwordEncoder.encode(rawPassword);
        // Atributos obrigatórios preenchidos, isPlatformAdmin = false
        return User.create(subscriptionId, email, hash, false);
    }

    // Criação do Admin da plataforma
    public User createPlatformAdmin(String email, String rawPassword, UUID subscriptionId) {
        String hash = passwordEncoder.encode(rawPassword);
        // isPlatformAdmin = true
        return User.create(subscriptionId, email, hash, true);
    }
}
```

**Vantagens da Factory:**
- Ponto centralizado de criação (se um campo obrigatório nascer amanhã, você só muda a Factory).
- Permite injeção de dependências (como `PasswordEncoder` ou `Clock`) sem poluir a entidade pura.

### Value Objects para Conceitos Imutáveis

```java
public record Money(BigDecimal amount, Currency currency) {
    public Money {
        if (amount.scale() > 2) {
            throw new BusinessException("Máximo 2 casas decimais");
        }
    }
}
```

---

## 3. Bounded Contexts — MVP

| Bounded Context | Aggregate Root | Regras Críticas |
|---|---|---|
| **Account** | `Account` | Saldo nunca é persistido, é sempre calculado (single-entry) via transações com `settledAt` preenchido. |
| **CreditCard** | `CreditCard`, `Invoice` | Faturas usam **Lazy Creation** (Just-in-Time). Só nascem no banco quando o primeiro lançamento do ciclo acontece. |
| **Transaction** | `Transaction` | Valor é sempre **absoluto (positivo)**. O impacto na conta é ditado pelo `type` (`INCOME` ou `EXPENSE`). Estornos são `INCOME` com `refundForId`. |
| **Transfer** | `Transfer` | Orquestra duas `Transactions` (Débito e Crédito) atômicamente. |
| **Category** | `Category` | Multiusuário, mas usa **Shared Reference Data** (`subscription_id` = null para categorias do sistema). |
| **User** | `User` | Autenticação e definição do `subscription_id` (injetado via `ThreadLocal` na requisição). |

---

## 4. O que NÃO fazer (Anti-patterns)

| Anti-pattern | Por quê |
|---|---|
| **Entidades anêmicas** | Usar entidades só com getters/setters e delegar regras pros services gera bugs e duplicação. |
| **`builder()` nos Services** | Cada service repete a lógica de criação. Falta padronização. |
| **Persistir Estados de Tempo** | Gravar `status = CLOSED` na Fatura requer um *cron job* de banco. Use propriedades derivadas (`paidAt`, `dueDate`). |
| **Valores Negativos para Saídas** | Confunde conciliação futura. Use Valores Absolutos + Tipo de Transação explícito. |

---

## 5. Referência para Implementação (Spec-Driven)

Ao desenvolver as *features*, os agentes devem:
1. Identificar o Bounded Context.
2. Encapsular toda a lógica de alteração de estado dentro da Entidade.
3. Usar a Factory para instanciar a Entidade.
4. Usar o Service apenas para coordenar (Buscar banco -> Chamar método da entidade -> Salvar banco).
