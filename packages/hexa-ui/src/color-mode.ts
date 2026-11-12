export type OuiColorMode = "light" | "dark";

export function initColorMode() {
    const root = document.documentElement;
    let stored: string | null = null;
    try {
        stored = localStorage.getItem("oui-color-mode");
    } catch {}
    if (stored === "light" || stored === "dark") root.classList.toggle("dark", stored === "dark");
    else if (matchMedia("(prefers-color-scheme: dark)").matches) root.classList.add("dark");
}

export function toggleColorMode(): OuiColorMode {
    const mode: OuiColorMode = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", mode === "dark");
    try {
        localStorage.setItem("oui-color-mode", mode);
    } catch {}
    return mode;
}
