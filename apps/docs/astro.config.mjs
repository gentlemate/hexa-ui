// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { initColorMode } from "hexa-ui/color-mode";

export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },
    integrations: [
        starlight({
            title: "Hexa UI",
            locales: { root: { label: "English", lang: "en-GB" } },
            customCss: ["./src/styles/global.css"],
            head: [{ tag: "script", content: `(${initColorMode})()` }],
            social: [{ icon: "github", label: "GitHub", href: "https://github.com/gentlemate/hexa-ui" }],
            sidebar: [
                {
                    label: "Guides",
                    items: ["guides/installation", "guides/theming", "guides/dark-mode"],
                },
                {
                    label: "Components",
                    items: [{ autogenerate: { directory: "components" } }],
                },
            ],
        }),
    ],
});
