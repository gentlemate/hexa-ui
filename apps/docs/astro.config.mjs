// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { initTheme, syncColorMode } from "./src/theme.ts";

export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },
    integrations: [
        starlight({
            title: "Onent UI",
            locales: { root: { label: "English", lang: "en-GB" } },
            customCss: ["./src/styles/global.css"],
            head: [
                { tag: "script", content: `(${syncColorMode})()` },
                { tag: "script", content: `(${initTheme})()` },
            ],
            components: {
                PageFrame: "./src/components/PageFrame.astro",
                PageSidebar: "./src/components/PageSidebar.astro",
                SocialIcons: "./src/components/SocialIcons.astro",
            },
            social: [{ icon: "github", label: "GitHub", href: "https://github.com/gentlemate/onent-ui" }],
            sidebar: [
                {
                    label: "Guides",
                    items: ["guides/installation", "guides/theming", "guides/dark-mode"],
                },
                {
                    label: "Components",
                    items: [{ autogenerate: { directory: "components" } }],
                },
                {
                    label: "Tools",
                    items: [{ label: "Theme builder", link: "/theme/" }],
                },
            ],
        }),
    ],
});
