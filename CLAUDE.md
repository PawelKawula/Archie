# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Archie is a simulation tool for designing and stress-testing distributed computer systems (clusters of servers with services). The goal is to let users design resilient system architectures—think proxy + HTTP server + database—and simulate their behavior under load. Long-term vision includes C4 model support. The architecture explicitly prioritizes decoupling domain logic from presentation to enable AI-driven state manipulation.

The repo has two parts:

- `frontend/` — Angular 21 SPA (the main active codebase)
- `backend/` — Django 5 (currently minimal; only admin route exists)

## Commands

### Frontend (run from `frontend/`)

```bash
pnpm install          # install dependencies
ng serve              # dev server at http://localhost:4200
ng build            # production build
ng test --no-watch    # run tests
ng build              # production build
ng generate component path/to/name   # scaffold a component (always use CLI)
biome format --write src/            # format after changes
biome lint src/                      # lint
```

### Backend (run from `backend/`)

```bash
uv run manage.py runserver    # dev server
uv run manage.py migrate      # apply migrations
uv run mypy .                 # type check
```

## Frontend Architecture

### State Layer — `ClusterStore` (NgRx Signals)

`src/app/core/cluster.store.ts` is the single source of truth for all nodes in the cluster. It holds `nodes: Node[]` and emits a typed `ClusterEvent` stream (`nodeAdded` / `nodeRemoved`) via RxJS `Subject`. All domain mutations go through store methods.

### Orchestrator — `src/app/core/orchestrator.service.ts`

The `Orchestrator` service is the primary entry point for user-initiated actions (add node, remove node, handle right-click). It coordinates between `ClusterStore`, `DialogService`, `NodeFactory`, and `ContextMenu`. Components should call `Orchestrator`, not the store directly.

### Canvas Layer — `src/app/core/canvas/canvas.service.ts`

The `Canvas` service owns the PixiJS `Application` and `Viewport`. It subscribes to `ClusterStore.events$` and keeps a `Map<nodeId, Container>` registry to sync domain state → visual representation. It must be initialized via `inject(Canvas).init(elementRef)` from the canvas component.

Always access PixiJS resources through their getters (`this.app`, `this.viewport`, `this.nodesLayer`) rather than the backing private fields. The getters throw a descriptive `ConfigurationError` if accessed before `init()`. Only the getter body itself and the assignment inside `init()` should reference the private field directly.

### Domain Models — `src/app/shared/domain/`

- `Node` (abstract base class) — has `id`, `type`, `name`, `icon`, `x`, `y`
- `Server extends Node` — has `connectors: Connector[]`
- `Text extends Node` — has `text: string`
- `Connector` — represents a network connection endpoint on a server
- `Connection` — simulates a packet queue with `outQueue → transitQueue → arrivedQueue` using `AsyncQueue`
- `Packet` — unit of data flowing through connections

### Folder Conventions

- `src/app/core/` — singleton services used app-wide (store, canvas, orchestrator)
- `src/app/shared/` — reusable components, domain models, utilities
- `src/app/shared/domain/` — pure domain classes (no Angular dependencies)
- `src/app/shared/utils/` — generic utilities (e.g., `AsyncQueue`)
- Route-specific components go in `src/app/routes/` mirroring URL structure (not yet populated)
- `src/app/libs/` — generated spartan-ng components (read-only, do not edit)

## Git Conventions

**Branch naming:** All new branches must start with `claude/` (e.g., `claude/add-packet-source`).

## Key Conventions

**Assertions over exceptions:** Use `assert(condition, msg)` from `core/utils.ts` for all invariant checks throughout domain logic. This throws `AssertionError` (from `core/exceptions.ts`) on failure.

**Angular patterns:**

- `standalone: true` is default in Angular 20+, do NOT set it explicitly
- Use `input()` / `output()` functions, not `@Input`/`@Output` decorators
- Use `inject()` function, not constructor injection
- Use native control flow: `@if`, `@for`, `@switch` — not structural directives
- `ChangeDetectionStrategy.OnPush` is set by default via `angular.json` schematics
- Use `class` bindings instead of `ngClass`; `style` bindings instead of `ngStyle`
- Do NOT use `@HostBinding` / `@HostListener` — use `host: {}` in decorator instead

**State:** Use NgRx Signals (`@ngrx/signals`) for global state, Angular signals for local component state. Use `update`/`set` on signals, never `mutate`.

**UI components:** Use spartan-ng (`@spartan-ng/brain`) components. Generate them with `ng g @spartan-ng/...`. Do not edit generated files in the `libs/` folder.

**Formatting/Linting:** Biome is the formatter and linter. Single quotes, spaces for indentation, semicolons required. `noUnusedImports` is an error.

**Testing:** Tests use Vitest + Angular TestBed. Use `@hirez_io/observer-spy` for observable assertions. Prefer integration tests over unit tests for components. Tests should verify PixiJS visual state matches domain state.

**Forms:** Signal forms > reactive forms. No template-driven forms.
