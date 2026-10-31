import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [tailwindcss()],
    build: {
        target: "es2022",
        lib: {
            entry: {
                index: "src/index.ts",
                "color-mode": "src/color-mode.ts",
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
                dropdown: "src/components/dropdown/index.ts",
                popover: "src/components/popover/index.ts",
                select: "src/components/select/index.ts",
                modal: "src/components/modal/index.ts",
                drawer: "src/components/drawer/index.ts",
                calendar: "src/components/calendar/index.ts",
                "date-field": "src/components/date-field/index.ts",
                "number-field": "src/components/number-field/index.ts",
                progress: "src/components/progress/index.ts",
                slider: "src/components/slider/index.ts",
                "range-calendar": "src/components/range-calendar/index.ts",
                "date-picker": "src/components/date-picker/index.ts",
                "date-range-picker": "src/components/date-range-picker/index.ts",
            },
            formats: ["es"],
            fileName: (_format, name) => `${name}.js`,
        },
        rollupOptions: {
            external: [/^lit(\/.*)?$/, /^lucide(\/.*)?$/, /^@floating-ui\//],
        },
    },
});
