## What

<!-- What changes and why. Link the issue if there is one. -->

## How to test

<!-- Steps a reviewer can follow. -->

## Checklist

- [ ] Branch is `<type>/<kebab-case>` and targets `dev` (only `dev` merges into `main`)
- [ ] Commits follow conventional commits (`feat`, `fix`, `chore`, …)
- [ ] Forms use `mui-schema-form-builder` (`FormBuilder` / `FormWizard`), styles live in `.styles.ts`
- [ ] Unit tests (and E2E for user flows) added or updated; coverage thresholds not lowered
- [ ] `bun run check` passes locally
