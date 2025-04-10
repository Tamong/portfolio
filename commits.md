# 📓 Conventional Commits Cheat Sheet

The **Conventional Commits** specification is a standard format for commit messages that improves readability, enables automation (like changelog generation), and supports semantic versioning.

---

## ✏️ Format

<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

---

## 🔤 Common Types

| Type       | Description                                                   |
| ---------- | ------------------------------------------------------------- |
| `feat`     | A new feature                                                 |
| `fix`      | A bug fix                                                     |
| `docs`     | Documentation only changes                                    |
| `style`    | Changes that do not affect code meaning (e.g., formatting)    |
| `refactor` | A code change that neither fixes a bug nor adds a feature     |
| `perf`     | A code change that improves performance                       |
| `test`     | Adding or correcting tests                                    |
| `chore`    | Maintenance tasks (e.g., tooling, configs, dependencies)      |
| `build`    | Changes that affect the build system or external dependencies |
| `ci`       | Changes to CI configuration and scripts                       |

---

## 🧠 Optional Scope

You can specify a scope to indicate the part of the codebase affected:

feat(auth): allow users to log in with Google fix(cart): prevent checkout crash on empty cart

---

## 💥 Breaking Changes

To indicate a **breaking change**, you can:

1. Add an exclamation mark `!` after the type:

feat!: remove legacy API support

2. Or include a `BREAKING CHANGE:` section in the commit body:

BREAKING CHANGE: The login endpoint has been removed.

---

## ✅ Benefits

- Clear and consistent commit history
- Enables auto-generated changelogs
- Supports semantic versioning
- Works well with tools like `semantic-release`, `commitlint`, and `standard-version`

---

## 📚 Resources

- [conventionalcommits.org](https://www.conventionalcommits.org)
- [semantic-release](https://semantic-release.gitbook.io)
- [commitlint](https://commitlint.js.org)
