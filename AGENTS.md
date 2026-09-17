# Development servers

- Always use Portly (`portly ...`) to start, stop, restart, inspect, or keep local development servers running.
- Start with `portly status --json`. Reuse a healthy managed server; if an in-scope server is running outside Portly, register it and use `portly take-over <project/server> --json`.
- Never launch persistent development servers directly, in the background, or through another supervisor.

# Website preview

- Read `CLAUDE.md` and the issue's latest brief before changing product claims.
- Issue #29's approved light direction supersedes the original dark-first direction.
- Work on a dedicated branch. `main` deploys production: do not push or merge it without a separate instruction.
- Blog/Pricing placeholders are preview-only. Do not enable `DICTUS_SITE_PREVIEW` on production.
