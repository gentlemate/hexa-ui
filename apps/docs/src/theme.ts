export type ThemeMode = "light" | "dark";
export type Theme = Record<ThemeMode, Record<string, string>>;

export const themeStorageKey = "oui-docs-theme";

export function parseTheme(css: string): Theme {
    const theme: Theme = { light: {}, dark: {} };
    for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
        const tokens = theme[selector.includes(".dark") ? "dark" : "light"];
        for (const [, name, value] of body.matchAll(/(--oui-[\w-]+)\s*:\s*([^;]+);/g)) tokens[name] = value.trim();
    }
    return theme;
}

export function themeToCss(theme: Theme) {
    return (Object.entries({ light: ":root", dark: ":root.dark" }) as [ThemeMode, string][])
        .filter(([mode]) => Object.keys(theme[mode]).length)
        .map(
            ([mode, selector]) =>
                `${selector} {\n${Object.entries(theme[mode])
                    .map(([name, value]) => `    ${name}: ${value};`)
                    .join("\n")}\n}\n`,
        )
        .join("\n");
}

export function syncColorMode() {
    const root = document.documentElement;
    const store = (key: string, value: string) => {
        try {
            localStorage.setItem(key, value);
        } catch {}
    };
    let stored: string | null = null;
    try {
        stored = localStorage.getItem("starlight-theme");
    } catch {}
    root.classList.toggle("dark", stored ? stored === "dark" : !matchMedia("(prefers-color-scheme: light)").matches);
    store("oui-color-mode", root.classList.contains("dark") ? "dark" : "light");
    new MutationObserver((mutations) => {
        const theme = root.classList.contains("dark") ? "dark" : "light";
        if (mutations.some(({ attributeName }) => attributeName === "data-theme")) {
            root.classList.toggle("dark", root.dataset.theme === "dark");
            store("oui-color-mode", root.dataset.theme === "dark" ? "dark" : "light");
        } else if (root.dataset.theme !== theme) {
            root.dataset.theme = theme;
            store("starlight-theme", theme);
            (window as any).StarlightThemeProvider?.updatePickers(theme);
        }
    }).observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });
}

export function initTheme() {
    const style = document.createElement("style");
    style.id = "oui-docs-theme";
    try {
        style.textContent = localStorage.getItem("oui-docs-theme");
    } catch {}
    document.documentElement.append(style);
}
