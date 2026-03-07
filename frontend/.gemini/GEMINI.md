You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Project description

- It's a frontend for app that should be a simulation of a cluser of computers that have services running on them
- It's main objective is providing users with ability to design computer system that is resilient and performant
- One very simple example is having a proxy, http server and database, and we want to simulate how this system would behave under load
- It should provide c4 modeling in the long run
- Main focus when designing this should be on decoupling program logic from it's representation, so it is easily testable without relying on some e2e tests
- Another important consideration is focus on AI, this program should be easy to simulate not only with its representation layer, but with manipulating some global state
  so it's easy to be manipulated by an AI.

## General Practices

- We prefer assertion errors to exceptions, wherever there is any more complex logic we keep on using assert function defined in core/utils.ts
- We are pretty generous with calling these assertions
- Most of the code that interops with domain logic and is not directly related fe. presentation layer, should use signal store events to update the state

## Common steps

- Make sure to run biome formatter after changes, but only on frontend or src directory
- If you introduce new features or see new edge cases add tests for them
- Make sure that tests still pass
- Use typia assertions to make sure that we operate on correct types, especially if it's stuff fetched from backend

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.
- Never hardcode two same strings, instead extract it to a const variable either in shared/texts.ts if it's in many different directories or as a readonly property in class, if it doesn't fall into one of these situations ask me what to do and localize all of them

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Signal forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.
- Use tailwind for styling

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Pixijs

- Use pixijs for 2d rendering on a canvas
- Read documentation here: https://pixijs.com/llms-medium.txt

### Folder structure

- Components that handle routes should be kept in routes folder and structure of this folder must reflect how they look in browser
- Every time you create an angular file use angular cli to do so, IF YOU DON'T HAVE ACCESS TO IT ASK FOR IT BEFORE DOING ANYTHING
- Use core module for services that are used across the entire app, such as authentication or error handling services
- The shared module contains reusable components, directives, and pipes that can be used across multiple feature modules

## Testing

- Tests should be thorough but not redundant
- The bigger the component, the more general tests should be
- You should prefer integration tests and result of user interaction instead of implementation
- Tests should include behaviour of pixijs, it should check if all the containers, sprites etc. are representing actual state correctly
