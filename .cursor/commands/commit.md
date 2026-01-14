---
description: Stage all changes and commit with a conventional commit message
---

# Conventional Commit

Stage all changes in the repository and create a commit using the Conventional Commits specification.

## Instructions

1. First, check what files have been changed using `git status`
2. Stage all changes with `git add .`
3. Analyze the staged changes to understand what was modified
4. Generate a conventional commit message based on the changes:
   - Use appropriate type: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`
   - Include scope if applicable (e.g., `feat(backend):`, `fix(frontend):`)
   - Write a concise description in imperative mood
   - Add body if the change is complex
   - Add breaking change footer if applicable (`BREAKING CHANGE:`)
5. Execute `git commit -m "<generated message>"`
6. Show the commit result

## Conventional Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (formatting, missing semi-colons, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

## Scope Examples

- `backend` - Backend/API changes
- `frontend` - Frontend/UI changes
- `auth` - Authentication related
- `api` - API endpoints
- `db` - Database changes
- `deps` - Dependency updates

## Examples

```
feat(backend): add user authentication with JWT

Implement JWT-based authentication for API endpoints.
Includes login, logout, and token refresh endpoints.

Closes #123
```

```
fix(frontend): resolve infinite loop in useItems hook

The dependency array was missing itemId, causing the effect
to run on every render.
```

```
docs: update setup instructions in README

Add missing Docker installation steps and update
environment variable examples.
```

## Notes

- Follow the guidelines in `CONTRIBUTING.md`
- Ensure your commit message is clear and concise
- Reference issue numbers when applicable (e.g., "Closes #123")
- Use present tense, imperative mood: "add feature" not "added feature"
