import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [tailwindcss()],
    build: {
        target: "es2022",
        lib: {
            entry: {
                index: "src/index.ts",
                button: "src/components/button/index.ts",
                input: "src/components/input/index.ts",
                icon: "src/components/icon/index.ts",
                "color-mode-button": "src/components/color-mode-button/index.ts",
                label: "src/components/label/index.ts",
                textarea: "src/components/textarea/index.ts",
                checkbox: "src/components/checkbox/index.ts",
                switch: "src/components/switch/index.ts",
                badge: "src/components/badge/index.ts",
                card: "src/components/card/index.ts",
                skeleton: "src/components/skeleton/index.ts",
                tabs: "src/components/tabs/index.ts",
                separator: "src/components/separator/index.ts",
                accordion: "src/components/accordion/index.ts",
                tooltip: "src/components/tooltip/index.ts",
                "dropdown-menu": "src/components/dropdown-menu/index.ts",
                select: "src/components/select/index.ts",
            },
            formats: ["es"],
            fileName: (_format, name) => `${name}.js`,
        },
        rollupOptions: {
            external: [/^lit(\/.*)?$/, /^lucide(\/.*)?$/, /^@floating-ui\//],
        },
    },
});
