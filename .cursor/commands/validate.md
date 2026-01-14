---
description: Validate changes before pushing - run linting, tests, and check documentation
---

# Validate Changes

Run comprehensive validation checks before pushing your changes to ensure code quality and completeness.

## Instructions

Follow these steps in order:

### 1. Check Git Status

```bash
git status
```

Show what files have been modified, added, or deleted.

### 2. Run Linting

```bash
make lint
```

Run ESLint and Prettier checks on all code. Report any errors or warnings.

### 3. Run Tests

```bash
make test
```

Run all tests (backend and frontend). Report any failures.

### 4. Check Documentation Requirements

Analyze the changed files and determine if documentation updates are needed:

| If You Changed | Check if Updated |
| -------------- | ---------------- |
| Backend architecture (new contexts, major refactoring) | `backend/ARCHITECTURE.md` |
| Frontend architecture (new features, major refactoring) | `frontend/ARCHITECTURE.md` |
| Project setup, installation, or configuration | `README.md` |
| Testing patterns or new test utilities | `backend/TESTING.md` or `frontend/TESTING.md` |
| Environment variables | `backend/.env.example`, `frontend/.env.example`, `README.md` |
| Database schema | `backend/prisma/schema.prisma`, `backend/ARCHITECTURE.md` |
| Breaking changes | Update relevant documentation with migration guide |

### 5. Check INVARIANTS.md Compliance

Verify changes don't violate any rules in `INVARIANTS.md`:

- Architecture boundaries (backend/frontend separation)
- Security requirements (no secrets in code, input validation)
- Testing requirements (tests for new features)
- Documentation requirements

### 6. Provide Validation Summary

#### ✅ All Checks Passed

```text
✅ Validation passed!

- Linting: ✅ No issues
- Tests: ✅ All passing
- Documentation: ✅ Up to date (or not required)
- INVARIANTS.md: ✅ No violations

You're good to commit and push!
```

#### ❌ Issues Found

```text
❌ Validation failed!

Issues:
- Linting: 3 errors in backend/src/auth/service.ts
- Tests: 2 failing tests in backend
- Documentation: Missing updates

Required actions:
1. Fix linting errors with: make lint-fix
2. Fix failing tests
3. Update backend/ARCHITECTURE.md (new auth service added)

Run /validate again after fixing.
```

## Quick Commands

If validation fails, suggest these commands:

```bash
# Auto-fix linting issues
make lint-fix

# Run tests in watch mode (requires shell in container)
make shell-be  # then: pnpm test:watch
make shell-fe  # then: pnpm test:watch

# View linting errors in detail
make lint
```

## Notes

- This command should be run **before committing** or as a pre-push check
- All checks must pass before opening a PR
- If you have uncommitted changes, the command will still run checks on your working directory
- Consider running this in CI/CD as well for automated validation

## Integration with Other Commands

After validation passes, you can:

1. Run `/commit` to create a conventional commit
2. Push your changes
3. Open a PR (CodeRabbit will automatically review it)
