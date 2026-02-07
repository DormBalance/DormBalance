## Branching Strategy

- The `main` branch is the **stable production branch**.
- **Do not commit directly to `main`.**

When working on a new feature, bug fix, or improvement:
1. Create a new branch from `main`  
   - Example: `feature/auth`, `feature/expenses`, `fix/balance-calculation`
2. Make all changes and commits in your feature branch.
3. Push your branch to GitHub.
4. Open a **Pull Request (PR)** into `main`.

---

## Pull Requests

- All changes must go through a Pull Request before being merged into `main`.
- At least **one team member approval** is required before merging.
- The feature must be tested and verified to work as expected.
- Address any requested changes or comments before merging.

Once approved, the branch may be merged into `main`.

---

## General Guidelines

- Keep commits small and focused.
- Write clear commit messages describing what was changed.
- Do not commit sensitive information (API keys, passwords, `.env` files).

---
