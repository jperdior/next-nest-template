---
description: Create a new git branch following the repository branching policy
---

# Create Branch

Create a new git branch following the branching conventions defined in CONTRIBUTING.md.

## Instructions

1. First, check the current branch status using `git status`
2. Ensure you're on `main` branch and it's up to date:
   - If not on main, run `git checkout main`
   - Run `git pull origin main`
3. Parse the user input to determine:
   - If a ticket ID is provided (e.g., `PROJ-123`), use it as the branch identifier
   - If a description is provided without a ticket, use it as the branch name suffix
   - If neither is provided, prompt or use a placeholder like `new-feature`
4. Determine the branch type based on context or user input:
   - `feature/` - for new features (default)
   - `fix/` - for bug fixes
   - `chore/` - for maintenance tasks
   - `docs/` - for documentation changes
   - `refactor/` - for refactoring
5. Create the branch name following the pattern: `<type>/<identifier>`
6. Execute `git checkout -b <branch-name>`
7. Show the result

## Branch Name Format

```
<type>/<ticket-or-description>
```

## Examples

| User Input               | Resulting Branch              |
| ------------------------ | ----------------------------- |
| `PROJ-123`               | `feature/PROJ-123`            |
| `fix PROJ-123`           | `fix/PROJ-123`                |
| `PROJ-123 add user auth` | `feature/PROJ-123`            |
| `fix bug in login`       | `fix/bug-in-login`            |
| `add dark mode`          | `feature/add-dark-mode`       |
| `chore update deps`      | `chore/update-deps`           |
| `docs api examples`      | `docs/api-examples`           |
| (no input)               | `feature/new-feature`         |

## Branch Types

- **feature/**: A new feature or enhancement (default)
- **fix/**: A bug fix
- **chore/**: Maintenance tasks, dependency updates
- **docs/**: Documentation changes
- **refactor/**: Code refactoring without feature changes

## Ticket ID Detection

If the input contains a ticket-style identifier (uppercase letters, optional dash, numbers, e.g., `PROJ-123`, `TICKET123`, `ABC-456`), use it as the branch identifier.

The pattern is: `[A-Z]+[-]?[0-9]+`

## Policy Reference

This command follows the branching policy defined in `CONTRIBUTING.md`:

> **Branching Strategy**
> - **Main Branch**: `main` - always deployable, protected
> - **Feature Branches**: `feature/your-feature-name`
> - **Fix Branches**: `fix/bug-description`
> - **Chore Branches**: `chore/task-description`

## Notes

- Always create branches from an up-to-date `main` branch
- Use kebab-case for descriptions (lowercase with dashes)
- Keep branch names concise but descriptive
- Delete branches after merging
