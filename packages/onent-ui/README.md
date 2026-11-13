# Onent UI

Framework-agnostic & themeable Web Components built with [Lit](https://lit.dev).

**[Documentation](https://onent-ui.vercel.app)**

## Installation

```sh
npm install onent-ui
```

Onent UI is distributed as ES modules and is meant to be used with a bundler such as Vite.

## Usage

Import the design tokens once, at the root of your app:

```js
import "onent-ui/theme.css";
```

Import the components. Each import registers the custom elements it contains:

```js
// All the components
import "onent-ui";

// Or only the ones you use
import "onent-ui/button";
import "onent-ui/input";
```

Use them in your markup:

```html
<oui-button>Button</oui-button>
```

## Theming

Components are styled from `--oui-*` custom properties. Override them on `:root`, or on any element to theme the components it contains:

```css
:root {
    --oui-primary: oklch(0.205 0 0);
    --oui-radius-control: 0px;
}
```

See the [theming guide](https://onent-ui.vercel.app/guides/theming/) for the full list of tokens.

## License

[MIT](./LICENSE)
