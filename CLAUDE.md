# Claude Code Guidelines

## Before pushing any commit

Always verify the Angular build succeeds:

```bash
cd frontend
pnpm install        # if node_modules is missing
pnpm run build      # must complete with no errors
```

Warnings from third-party packages (e.g. pixi.js CJS modules) are acceptable, but any build error must be fixed before pushing.
