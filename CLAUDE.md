# CLAUDE.md

> Central orchestration + meta-rules for AI assistants working in this repo.  
> This file MUST stay in the top-level directory and MUST be read first.

## Purpose

You are an AI assistant operating on this repository. This document defines:

- How you should behave.
- Which documents control which concerns.
- How and when you are allowed to update documentation and code.
- What **must never be violated** (by deferring to `INVARIANTS.md`).

## Authority & Document Hierarchy

When there is a conflict between sources, follow this order of precedence:

1. **INVARIANTS.md**
   - Non-negotiable architecture, business, and safety invariants.
   - You **must not** change this file.
   - If you believe something should change, you may only:
     - Call it out explicitly to the user.
     - Propose new wording, but **do not edit** the file itself.

2. **ARCHITECTURE.md** (backend/frontend specific)
   - Canonical system architecture, flows, and constraints.
   - Can be updated when the _actual_ architecture changes, but must remain consistent with `INVARIANTS.md`.

3. **TESTING.md** (backend/frontend specific)
   - Testing approach, expectations, and scenario-specific instructions.
   - You must follow them when creating or updating tests.

4. **README.md** & **AGENTS.md** & **CONTRIBUTING.md**
   - Onboarding, agent boundaries, and repo governance.
   - These govern how you collaborate and present changes.

5. **Source code**
   - Where behavior is actually implemented.
   - If code contradicts higher-level docs:
     - Treat `INVARIANTS.md` as source of truth.
     - Flag the inconsistency.
     - Propose or perform updates to the _lower-priority_ artifacts (architecture/docs/code) so they align.

## Behavioral Rules for AI

When operating in this repo, you must:

1. **Read before acting**
   - For any non-trivial change:
     - Skim `INVARIANTS.md`.
     - Check `README.md` and `AGENTS.md` for context.
     - Consult specialized docs when relevant:
       - Architecture: `backend/ARCHITECTURE.md` or `frontend/ARCHITECTURE.md`
       - Testing: `backend/TESTING.md` or `frontend/TESTING.md`
       - Governance: `CONTRIBUTING.md`

2. **Respect invariants and boundaries**
   - Never propose or implement changes that violate:
     - Architecture/business invariants in `INVARIANTS.md`.
     - Security considerations in `AGENTS.md`.
   - If a user asks for something that would violate an invariant:
     - Clearly explain the conflict.
     - Offer alternative, compliant solutions.

3. **Prefer minimal, consistent change**
   - Keep changes focused and coherent.
   - Avoid introducing new patterns when existing ones suffice.
   - Reuse established conventions from the codebase and documentation.

4. **Communicate clearly**
   - When proposing or describing changes, explain:
     - What is changing.
     - Why it's changing.
     - Which docs (if any) must be updated.

## When and How to Update Each Document

You may update the following documents under these conditions:

### `README.md`

**You may update when:**
- Onboarding steps (setup, quickstart) change.
- Project structure changes in a way developers/agents should know.
- New important features or capabilities appear.

**When updating:**
- Keep it concise and "at a glance".
- Ensure it:
  - Gives a high-level overview.
  - Points to deeper docs (e.g. `ARCHITECTURE.md`, `TESTING.md`).
- Avoid deep, scenario-specific content here; link out instead.

### `AGENTS.md`

**You may update when:**
- Build or test commands change.
- Testing instructions and code style guidelines evolve.
- Database limitations or logging practices change.
- Security considerations for day-to-day development change.

**When updating:**
- Make boundaries and expectations for autonomous agents explicit.
- Keep it practical and task-oriented.

### `CONTRIBUTING.md`

**You may update when:**
- The process for submitting changes evolves (PR flow, branching strategy, etc.).
- The way to report bugs or request enhancements changes.

**When updating:**
- Keep procedures clear and step-by-step where helpful.
- Do not contradict `INVARIANTS.md` or `ARCHITECTURE.md`.

### `ARCHITECTURE.md` (backend/frontend)

**You may update when (and only when):**
- System architecture actually changes, such as:
  - New/removed features or services.
  - Changed component responsibilities or boundaries.
  - New/changed dependencies (databases, external APIs, queues, etc.).
  - Data flow, state management, or architectural patterns change.

**When updating:**
- Keep it high-level and stable.
- Avoid low-level implementation details that will churn quickly.
- Ensure no contradictions with `INVARIANTS.md`.

### `TESTING.md` (backend/frontend)

**You may update when:**
- New test types or tools are introduced.
- The testing philosophy or "what to test vs. not test" changes.
- New canonical test patterns emerge.

**When updating:**
- Keep it **generic but actionable**.
- Provide patterns and examples.

## What You Must Never Edit

- `INVARIANTS.md` — read-only for AI.
  - You may **suggest** edits to the user in natural language, but must not modify it directly.

If in doubt about whether you are allowed to change a file, **assume you are not**, and explain the situation to the user before proceeding.

## Typical Workflows

### Implementing a New Feature

1. Read:
   - `INVARIANTS.md` (quick skim for relevant constraints).
   - `README.md` (project overview).
   - `AGENTS.md` (commands, style, testing basics).
   - `ARCHITECTURE.md` (affected components).

2. Design:
   - Ensure the proposal respects invariants and architecture.

3. Implement:
   - Write or modify code following DDD/Clean Architecture patterns.
   - Add/update tests following `TESTING.md`.

4. Update docs if needed:
   - Architecture changes → `ARCHITECTURE.md`.
   - New commands/flows → `AGENTS.md` or `README.md`.

5. Summarize:
   - Clearly describe what changed and which docs were updated.

### Implementing a New HTTP API Endpoint (Spec-Driven)

This project follows **Spec-Driven Development** for HTTP APIs. The OpenAPI spec is the single source of truth.

1. **Update OpenAPI Spec First**:
   - Edit `specs/openapi.yaml`
   - Add the new endpoint under `paths:`
   - Define request/response schemas under `components/schemas:`

2. **Generate Shared Types**:
   - Run `make codegen`
   - This generates TypeScript types in `packages/api-types/src/generated.ts`

3. **Implement Backend**:
   - Create use case in `application/` layer
   - Create controller in `presentation/http/`
   - Import types from `@/shared/types/api-types`
   - Types are automatically type-checked against the spec

4. **Implement Frontend**:
   - Create API client in `infrastructure/api/`
   - Import types from `@/shared/types/api-types`
   - Frontend and backend share the same type definitions

5. **Add Tests**:
   - Backend: Integration tests for endpoints
   - Frontend: Component tests with MSW

6. **Update Docs**:
   - If this is a new bounded context, update `ARCHITECTURE.md`

**Important Notes:**
- **HTTP APIs**: Always update spec first, then run `make codegen`
- **CLI Commands**: No spec needed — they reuse the same use cases as HTTP
- **Domain/Application Layers**: Use Zod for validation, not generated types

### Fixing a Bug

1. Identify whether the bug indicates:
   - Incorrect design/assumptions in docs.
   - Implementation drift from architecture.

2. If only implementation is wrong:
   - Fix the code.
   - Update tests as needed.
   - Only update docs if behavior or guarantees changed.

3. If architecture/docs are wrong:
   - Ensure the fix is consistent with `INVARIANTS.md`.
   - Update `ARCHITECTURE.md` or `TESTING.md` as appropriate.

## Safety & Escalation

If a requested change:
- Violates `INVARIANTS.md`, or
- Introduces significant security, data loss, or reliability risk

Then:
1. Do **not** implement the change as requested.
2. Explain the risk clearly.
3. Offer safer alternatives or request human review.

## Summary

- **Start here**: always read `CLAUDE.md` first.
- **Never violate**: `INVARIANTS.md`.
- **Keep aligned**: code ↔ `ARCHITECTURE.md` ↔ testing docs.
- **Use the right doc for the right purpose**:
  - Onboarding & overview: `README.md`
  - Agent behavior & commands: `AGENTS.md`
  - Governance & process: `CONTRIBUTING.md`
  - Architecture: `backend/ARCHITECTURE.md`, `frontend/ARCHITECTURE.md`
  - Testing: `backend/TESTING.md`, `frontend/TESTING.md`

Your primary responsibility is to help the system evolve **without breaking its invariants** and to keep documentation and implementation **coherent and consistent**.
