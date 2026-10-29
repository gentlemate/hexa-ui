export type HxColorMode = "light" | "dark";

export function initColorMode() {
    const root = document.documentElement;
    let stored: string | null = null;
    try {
        stored = localStorage.getItem("hx-color-mode");
    } catch {}
    if (stored === "light" || stored === "dark") root.classList.toggle("dark", stored === "dark");
    else if (matchMedia("(prefers-color-scheme: dark)").matches) root.classList.add("dark");
}

export function toggleColorMode(): HxColorMode {
    const mode: HxColorMode = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", mode === "dark");
    try {
        localStorage.setItem("hx-color-mode", mode);
    } catch {}
    return mode;
}
