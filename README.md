# onent-ui

Lit-based Web Component library.

```
packages/onent-ui/   library
apps/demo/          demo page
apps/docs/          documentation site
```

```bash
pnpm install
pnpm dev       # demo (apps/demo)
pnpm build     # packages/onent-ui/dist/ : ESM + .d.ts
```

```ts
import "onent-ui";
import "onent-ui/button";
```

## Add a component

In `packages/onent-ui/`:

1. Create `src/components/<name>/oui-<name>.ts` (extending `OuiElement`) and `index.ts`.
2. Export it from `src/index.ts`.
3. Add an entry to `vite.config.ts` and an export to `package.json` (`./<name>`).

Tailwind classes must appear as complete, literal strings in `src/`.
