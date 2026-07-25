---
name: "speckit-domain-validator"
description: "Validates that the feature's technical plan aligns with Saldu's DDD principles, bounded contexts, and architectural constraints before task generation. Read-only analysis — produces a DDD Compliance Report with go/no-go recommendation."
compatibility: "Requires spec-kit project structure with .specify/ directory and a completed plan.md"
metadata:
  author: "saldu"
  source: ".agents/skills/speckit-domain-validator/SKILL.md"
---


## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).
If provided, treat it as additional context or constraints for the validation.
If empty, validate the active feature found in `.specify/feature.json`.

## Pre-Execution Checks

**Check for extension hooks (before domain validation)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_domain_validate` key.
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally.
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable.
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation.
- When constructing slash commands from hook command names, replace dots (`.`) with hyphens (`-`). For example, `speckit.git.commit` → `/speckit-git-commit`.
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```
  - **Mandatory hook** (`optional: false`):
    ```
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before proceeding to the Outline.
    ```
    After emitting the block above you MUST actually invoke the hook and wait for it to finish before continuing.
- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently.

## Goal

Detect domain model, bounded context, and architectural violations in the feature's `plan.md`
**before tasks are generated**. Fixing these issues at the plan stage is 10× cheaper than
fixing them after implementation.

This command runs **after `/speckit-plan`** and **before `/speckit-tasks`**.

## Operating Constraints

**STRICTLY READ-ONLY**: Do **not** modify any files. Output a structured DDD Compliance Report
in-session. Offer specific recommendations — user must approve and then manually edit `plan.md`
before re-running `/speckit-tasks`.

**Constitution Authority**: The project constitution (`.specify/memory/constitution.md`) and
`AGENTS.md` sections 5 and 6 are **non-negotiable** within this analysis scope. Violations
of these are always CRITICAL.

## Outline

### Step 1 — Initialize Context

1. Read `.specify/feature.json` to resolve FEATURE_DIR.
2. Load the following files — abort with a clear message if any required file is missing:
   - **REQUIRED**: `FEATURE_DIR/plan.md` — the technical plan under review
   - **REQUIRED**: `FEATURE_DIR/spec.md` — the feature specification (for domain concepts)
   - **REQUIRED**: `AGENTS.md` sections 5 (Architecture), 6 (Bounded Contexts), 3 (Absolute Rules)
   - **REQUIRED**: `.specify/memory/constitution.md` — governing constraints
   - **OPTIONAL**: `FEATURE_DIR/data-model.md` — entity definitions (if exists, load it)
   - **OPTIONAL**: `FEATURE_DIR/research.md` — technical decisions (if exists, load it)

3. Produce a one-line context summary:
   ```
   Validating: {feature name} | Plan: FEATURE_DIR/plan.md | Mode: READ-ONLY
   ```

---

### Step 2 — Build Domain Intent Inventory

From `plan.md` and `data-model.md` (if present), extract:

- **Proposed entities**: All classes/models explicitly named (e.g., `User`, `InviteToken`, `AuthService`)
- **Proposed aggregate roots**: Entities that appear to be aggregate roots (top-level, own lifecycle)
- **Proposed value objects**: Immutable data structures (records, embedded objects)
- **Proposed services**: Application and domain services mentioned
- **Proposed file paths**: Exact paths from the "Project Structure" section
- **Proposed Flyway migrations**: Migration files referenced

From `AGENTS.md §6`, build the **Saldu Bounded Context Map**:

| Bounded Context | Aggregate Root | Known Entities |
|----------------|----------------|----------------|
| User | User | InviteToken, AccessRequest |
| Account | Account | - |
| CreditCard | CreditCard | Invoice, Installment |
| Transaction | Transaction | — |
| Transfer | Transfer | — |
| Category | Category | Subcategory |

---

### Step 3 — Detection Passes

Run each validation pass in sequence. Limit findings to 30 total; aggregate remainder in overflow summary.

#### Pass A — Bounded Context Alignment

For each proposed entity, determine:
- **Fits existing BC**: Entity logically belongs to an existing Bounded Context
- **New BC needed**: Entity represents a new bounded context (document it explicitly)
- **Misplaced**: Entity is placed in the wrong context (e.g., `Invoice` in `user/` package)
- **Cross-BC dependency**: Service or entity imports from a different bounded context (forbidden)

**CRITICAL** findings:
- Entity placed in wrong bounded context package
- Cross-bounded-context dependency (any import between `domain/{contextA}` and `domain/{contextB}`)

**HIGH** findings:
- New entity that doesn't fit any existing BC without justification

---

#### Pass B — Aggregate Root & Factory Compliance

For each proposed **aggregate root**:

1. **Factory class planned?**
   - CRITICAL if an aggregate root is created without a Factory class in `domain/{context}/factory/`
   - CRITICAL if any service uses `new AggregateRoot(...)` or `.builder().build()` directly

2. **Repository interface planned?**
   - HIGH if an aggregate root has no repository interface in `domain/{context}/repository/`

3. **Rich model vs. Anemic model**
   - Scan `plan.md` and `data-model.md` for business logic descriptions
   - CRITICAL: If any service method description contains domain logic that belongs in the entity
     Examples of anemic patterns to flag:
     - "Service sets the status to X" → should be `entity.transitionToX()`
     - "Service validates that the field Y is Z" → should be `entity.validateY()`
     - "Service calculates the balance" → should be `account.calculateBalance()`
   - HIGH: If entities have no methods described beyond getters/setters

---

#### Pass C — Layer Dependency Rules

From the proposed file paths in `plan.md`, verify the dependency rules from `AGENTS.md §5`:

| Planned Layer | Forbidden Imports |
|---------------|-------------------|
| `domain/{context}/` | Anything from `application/`, `infrastructure/`, `presentation/` |
| `application/{context}/` | Anything from `infrastructure/`, `presentation/` |
| `infrastructure/` | Anything from `presentation/` |

Flag any plan description that implies a forbidden import (e.g., "domain entity calls repository directly", "service imports JPA entity manager").

**CRITICAL**: Any described dependency that violates the layer rules.

---

#### Pass D — Multi-tenancy Plan Coverage

Verify that `plan.md` addresses the multi-tenancy requirements:

- [ ] Is `subscription_id` mentioned for new JPA entities that store user data?
- [ ] Is the Hibernate filter referenced for new queries?
- [ ] Is `SubscriptionContext` propagation described for new endpoints?
- [ ] Are RLS policies mentioned for new Flyway migration tables?
- [ ] Is there any `JOIN` planned across subscription boundaries? → CRITICAL if yes

**CRITICAL** if `subscription_id` is absent from any new data-storing entity's plan.
**HIGH** if RLS is not mentioned for new tables.

---

#### Pass E — Financial Data Safety Plan Coverage

If the feature touches accounts, balances, transactions, or invoices:

- [ ] Are manual adjustments modeled as regular Transactions? → CRITICAL if direct balance mutation planned
- [ ] Are soft-delete columns planned for financial entities? → CRITICAL if hard delete planned
- [ ] Is a reason/description mandatory for manual balance adjustment Transactions?
- [ ] Is auditoria (audit log) described for balance-changing operations?

Skip this pass entirely if the feature spec confirms no financial data is touched.

---

#### Pass F — Forbidden Patterns

Scan `plan.md` for explicit mentions of the following forbidden patterns:

| Pattern | Severity | Alternative |
|---------|----------|-------------|
| Event sourcing | HIGH | DDD pragmático — apenas o necessário |
| CQRS | HIGH | DDD pragmático — apenas o necessário |
| Domain Events | HIGH | DDD pragmático — apenas o necessário |
| `H2` in integration tests | HIGH | Use Testcontainers + PostgreSQL real |
| `builder()` on aggregate root in service | CRITICAL | Use Factory class |
| Hard delete (DELETE FROM financial table) | CRITICAL | Soft-delete only |
| Storing `subscription_id` as hardcoded value | CRITICAL | Use SubscriptionContext |
| Stack trace in API error response | HIGH | RFC 9457 ProblemDetail |
| Negative values in Transactions | CRITICAL | Use absolute positive values + `INCOME`/`EXPENSE` type |
| Physical `status` column on Invoice | CRITICAL | Use dynamic computation based on dates (`closingDate`, `paidAt`) |

---

#### Pass G — Missing Plan Elements

Check for elements that MUST be present in any Saldu plan:

- [ ] `Constitution Check` table present and all items addressed
- [ ] `subscription_id` in the data model for user-data entities
- [ ] At least one Factory class planned per aggregate root
- [ ] At least one Repository interface planned per aggregate root
- [ ] Flyway migration file named and referenced
- [ ] Testcontainers mentioned for integration tests (not H2)

**HIGH** for each missing mandatory element.

---

### Step 4 — Severity Assignment

| Severity | Meaning |
|----------|---------|
| **CRITICAL** | Violates Constitution or AGENTS.md MUST rule — blocks proceeding to `/speckit-tasks` |
| **HIGH** | Significant DDD or architecture gap — should fix before tasks |
| **MEDIUM** | Style or completeness issue — can proceed but recommended to fix |
| **LOW** | Minor improvement — informational only |

---

### Step 5 — Produce DDD Compliance Report

Output a Markdown report (no file writes) with the following structure:

```markdown
## DDD Compliance Report — {Feature Name}

**Validated**: FEATURE_DIR/plan.md
**Date**: {ISO date}
**Mode**: Read-only | Plan stage (pre-tasks)

### Summary
- **Verdict**: ✅ GO | ⚠️ GO WITH FIXES | 🚫 NO-GO
- **CRITICAL**: N
- **HIGH**: N
- **MEDIUM**: N
- **LOW**: N

### Findings

| ID | Pass | Severity | Location | Issue | Recommendation |
|----|------|----------|----------|-------|----------------|
| D1 | B — Factory | CRITICAL | plan.md: UserService | `User` aggregate root created via `new User(...)` in service | Add `UserFactory` to `domain/user/factory/` |
| D2 | D — Multi-tenancy | HIGH | plan.md: data-model | `InviteToken` entity has no `subscription_id` field planned | Add `subscription_id` to InviteToken data model |

### Bounded Context Map — Proposed vs. Existing

| Entity | Proposed Package | Expected BC | Status |
|--------|-----------------|-------------|--------|
| User | domain/user/ | User BC ✅ | Correct |

### Verdict & Next Steps

**{Verdict}**

{If ✅ GO}:
No CRITICAL or HIGH issues found. Proceed to `/speckit-tasks`.

{If ⚠️ GO WITH FIXES}:
MEDIUM/LOW issues found. You may proceed to `/speckit-tasks`, but consider
fixing the following before implementation to avoid rework:
[list HIGH/MEDIUM items]

{If 🚫 NO-GO}:
CRITICAL issues found — DO NOT proceed to `/speckit-tasks` until resolved.
Edit `FEATURE_DIR/plan.md` to address the issues above, then re-run
`/speckit-domain-validator`.

Issues to fix:
[list CRITICAL items with specific edit instructions]
```

---

### Step 6 — Offer Remediation Suggestions

Ask the user:
> "Would you like me to suggest specific edits to `plan.md` to address the top N critical/high issues?"

Do **NOT** apply edits automatically. Only offer them if the user confirms.

---

## Mandatory Post-Execution Hooks

**You MUST complete this section before reporting completion to the user.**

Check if `.specify/extensions.yml` exists in the project root.
- If it does not exist, or no hooks are registered under `hooks.after_domain_validate`, skip to the Completion Report.
- If it exists, read it and look for entries under the `hooks.after_domain_validate` key.
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue to the Completion Report.
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable.
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation.
- When constructing slash commands from hook command names, replace dots (`.`) with hyphens (`-`).
- For each executable hook, output the following based on its `optional` flag:
  - **Mandatory hook** (`optional: false`):
    ```
    ## Extension Hooks

    **Automatic Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}
    ```
    After emitting the block above you MUST actually invoke the hook and wait for it to finish.
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```

## Completion Report

Report completion to the user with:
- Verdict: GO / GO WITH FIXES / NO-GO
- Count of findings by severity
- Top 3 most critical issues (if any)
- Explicit next step:
  - GO → "Run `/speckit-tasks` to generate the task list."
  - GO WITH FIXES → "Consider fixing the HIGH issues in `plan.md`, then run `/speckit-tasks`."
  - NO-GO → "Fix the CRITICAL issues in `plan.md` and re-run `/speckit-domain-validator`."

## Done When

- [ ] Context loaded (plan.md, spec.md, AGENTS.md, constitution.md)
- [ ] All 7 detection passes completed (A through G)
- [ ] DDD Compliance Report generated with verdict and findings table
- [ ] Bounded Context Map produced showing proposed vs. expected placement
- [ ] Remediation offer presented to user
- [ ] Extension hooks dispatched or skipped
- [ ] Completion reported with verdict and explicit next step
