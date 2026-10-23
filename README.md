# hexa-ui

Lit-based Web Component library.

```
packages/hexa-ui/   library
apps/demo/          demo page
apps/docs/          documentation site
```

```bash
pnpm install
pnpm dev       # demo (apps/demo)
pnpm build     # packages/hexa-ui/dist/ : ESM + .d.ts
```

```ts
import "hexa-ui";
import "hexa-ui/button";
```

## Add a component

In `packages/hexa-ui/`:

1. Create `src/components/<name>/hx-<name>.ts` (extending `HxElement`) and `index.ts`.
2. Export it from `src/index.ts`.
3. Add an entry to `vite.config.ts` and an export to `package.json` (`./<name>`).

Tailwind classes must appear as complete, literal strings in `src/`.
