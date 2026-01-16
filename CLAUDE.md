# CLAUDE.md

> Central orchestration rules for AI assistants working in this repository.
> This file MUST stay in the top-level directory and MUST be read first.

## Purpose

Defines:
- How AI assistants should behave
- Which documents control which concerns
- When you can update documentation and code
- What must never be violated

## Document Hierarchy

When there is conflict, follow this order:

1. **INVARIANTS.md** - Non-negotiable rules (READ-ONLY for AI)
2. **DDD_GUIDE.md** - Architecture reference
3. **Module ARCHITECTURE.md** - Module-specific patterns
4. **Module TESTING.md** - Testing approach
5. **PLAN.md** - Planning guidelines for epics and tasks
6. **AGENTS.md**, **README.md**, **CONTRIBUTING.md** - Operations and governance
7. **Source code** - Actual implementation

If code contradicts `INVARIANTS.md`, treat invariants as truth and flag the inconsistency.

## Behavioral Rules

### 1. Read Before Acting

For non-trivial changes:
- Skim `INVARIANTS.md`
- Check `README.md` and `AGENTS.md`
- Consult `DDD_GUIDE.md` for architecture
- Check module-specific `ARCHITECTURE.md` and `TESTING.md`

### 2. Plan Before Acting

For non-trivial changes, use plan mode to classify and structure work:
- Consult `PLAN.md` for planning guidelines
- Classify request as **epic** (multi-task) or **task** (focused)
- Epics: Break into standalone tasks with implementation details
- Tasks: Provide detailed technical implementation plan
- **Spec-Driven**: For HTTP changes, always plan spec updates FIRST

📖 **Planning reference**: See [PLAN.md](./PLAN.md)

### 3. Respect Invariants

Never violate:
- Architecture/business invariants in `INVARIANTS.md`
- Security considerations

If user requests violate invariants:
- Explain the conflict clearly
- Offer compliant alternatives

### 4. Respect DDD Architecture

- **Domain logic** → `shared/contexts/` (bounded contexts)
- **App logic** → `modules/` (thin HTTP/UI layers)
- Modules **import** contexts, never contain domain logic
- See `DDD_GUIDE.md` for patterns

### 5. Prefer Minimal Change

- Keep changes focused
- Reuse existing patterns
- Avoid unnecessary complexity

### 6. Communicate Clearly

Explain:
- What is changing
- Why it's changing
- Which docs need updates

## Document Update Rules

### You MAY Update

- **README.md** - When onboarding or structure changes
- **AGENTS.md** - When commands or workflows change
- **CONTRIBUTING.md** - When processes change
- **DDD_GUIDE.md** - When architecture actually changes
- **Module ARCHITECTURE.md** - When module patterns change
- **Module TESTING.md** - When testing approach changes

### You MUST NOT Update

- **INVARIANTS.md** - Suggest changes to user only

### When Updating

- Keep it concise
- Ensure consistency with `INVARIANTS.md`
- Avoid low-level details that churn quickly

## Common Workflows

### Implementing a New Feature

1. Read: `INVARIANTS.md`, `DDD_GUIDE.md`, relevant module docs
2. Design: Respect invariants and architecture
3. Implement: Follow DDD patterns (see `DDD_GUIDE.md`)
4. Test: Write tests alongside code (see module `TESTING.md`)
5. Update docs: If architecture or commands changed

### Implementing a New HTTP Endpoint

**This project uses Spec-Driven Development:**

1. Update `modules/[module]/specs/openapi.yaml` first
2. Run `make codegen`
3. Implement backend controller (thin - delegates to contexts)
4. Implement frontend API client
5. Add tests

📖 **Details**: Module `backend/AGENTS.md`

### Fixing a Bug

1. Identify if bug is in implementation or design
2. Fix code
3. Update tests
4. Update docs only if behavior guarantees changed

## Safety & Escalation

If requested change:
- Violates `INVARIANTS.md`, OR
- Introduces security/data loss/reliability risk

Then:
1. Do NOT implement as requested
2. Explain the risk clearly
3. Offer safer alternatives or request human review

## Summary

- **Start here**: Read `CLAUDE.md` first
- **Never violate**: `INVARIANTS.md`
- **Architecture reference**: `DDD_GUIDE.md`
- **Commands**: `AGENTS.md`
- **Keep aligned**: Code ↔ docs ↔ invariants

Your responsibility: Help the system evolve **without breaking invariants** and keep documentation **coherent and consistent**.
