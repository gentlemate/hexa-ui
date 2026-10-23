import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";

const htmlInclude = (): Plugin => ({
    name: "html-include",
    transformIndexHtml(html, { filename }) {
        return html.replace(/^([ \t]*)<!-- include:(.+?) -->/gm, (_match, indent: string, file: string) =>
            readFileSync(resolve(dirname(filename), file), "utf-8").replace(/^(?=.)/gm, indent),
        );
    },
});

export default defineConfig({
    plugins: [tailwindcss(), htmlInclude()],
});
