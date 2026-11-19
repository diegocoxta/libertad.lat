<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Git commits

Always commit as `Diego Costa <diego@diegocosta.me>` (set `user.name` / `user.email` before committing). Never add AI attribution to commits: no `Co-Authored-By`, session links, or other AI references in commit messages.

## Dependabot

`.github/workflows/dependabot.yml` runs `npm run lint` and `tsc` on Dependabot PRs and squash-merges the minor and patch ones; majors stay manual. An indirect (lockfile-only) dependency has no `update-type:` in its commit, so its type comes from comparing `from X to Y` (same major, and same minor when the major is 0). The cron runs Fridays at 20:17 Bahia (Dependabot opens its weekly PRs on Monday, so their checks have the week to finish and a breaking merge lands on the weekend), off the top of the hour, because GitHub delays or drops scheduled runs at `:00`. Minor and patch updates arrive grouped in one PR (`.github/dependabot.yml`). It doesn't use branch protection or `gh pr merge --auto`: the merge happens inside the job, after the checks. Before merging, the job waits for every other check on the PR (other workflows and Vercel): only a failed one blocks, cancelled is fine. It lists them with `gh pr checks`, which is why the workflow declares `actions`, `checks` and `statuses` read permissions (without them the step fails with "Resource not accessible by integration" and nothing is merged). `typescript` major updates are ignored in `.github/dependabot.yml` until TypeScript 7.1 ships and typescript-eslint and Next support it.
