import type { Theme, ThemeMode } from "./theme";

type Shade = 50 | 100 | 200 | 400 | 500 | 800 | 900 | 950;

const palettes: Record<string, Record<Shade, string>> = {
    slate: {
        50: "0.984 0.003 247.858",
        100: "0.968 0.007 247.896",
        200: "0.929 0.013 255.508",
        400: "0.704 0.04 256.788",
        500: "0.554 0.046 257.417",
        800: "0.279 0.041 260.031",
        900: "0.208 0.042 265.755",
        950: "0.129 0.042 264.695",
    },
    gray: {
        50: "0.985 0.002 247.839",
        100: "0.967 0.003 264.542",
        200: "0.928 0.006 264.531",
        400: "0.707 0.022 261.325",
        500: "0.551 0.027 264.364",
        800: "0.278 0.033 256.848",
        900: "0.21 0.034 264.665",
        950: "0.13 0.028 261.692",
    },
    zinc: {
        50: "0.985 0 0",
        100: "0.967 0.001 286.375",
        200: "0.92 0.004 286.32",
        400: "0.705 0.015 286.067",
        500: "0.552 0.016 285.938",
        800: "0.274 0.006 286.033",
        900: "0.21 0.006 285.885",
        950: "0.141 0.005 285.823",
    },
    neutral: {
        50: "0.985 0 0",
        100: "0.97 0 0",
        200: "0.922 0 0",
        400: "0.708 0 0",
        500: "0.556 0 0",
        800: "0.269 0 0",
        900: "0.205 0 0",
        950: "0.145 0 0",
    },
    stone: {
        50: "0.985 0.001 106.423",
        100: "0.97 0.001 106.424",
        200: "0.923 0.003 48.717",
        400: "0.709 0.01 56.259",
        500: "0.553 0.013 58.071",
        800: "0.268 0.007 34.298",
        900: "0.216 0.006 56.043",
        950: "0.147 0.004 49.25",
    },
    taupe: {
        50: "0.986 0.002 67.8",
        100: "0.96 0.002 17.2",
        200: "0.922 0.005 34.3",
        400: "0.714 0.014 41.2",
        500: "0.547 0.021 43.1",
        800: "0.268 0.011 36.5",
        900: "0.214 0.009 43.1",
        950: "0.147 0.004 49.3",
    },
    mist: {
        50: "0.987 0.002 197.1",
        100: "0.963 0.002 197.1",
        200: "0.925 0.005 214.3",
        400: "0.723 0.014 214.4",
        500: "0.56 0.021 213.5",
        800: "0.275 0.011 216.9",
        900: "0.218 0.008 223.9",
        950: "0.148 0.004 228.8",
    },
    olive: {
        50: "0.988 0.003 106.5",
        100: "0.966 0.005 106.5",
        200: "0.93 0.007 106.5",
        400: "0.737 0.021 106.9",
        500: "0.58 0.031 107.3",
        800: "0.286 0.016 107.4",
        900: "0.228 0.013 107.4",
        950: "0.153 0.006 107.1",
    },
};

const shades: Record<ThemeMode, Record<string, Shade | string>> = {
    light: {
        "--hx-background": "oklch(1 0 0)",
        "--hx-foreground": 950,
        "--hx-surface": "oklch(1 0 0)",
        "--hx-surface-foreground": 950,
        "--hx-primary": 900,
        "--hx-primary-foreground": 50,
        "--hx-secondary": 100,
        "--hx-secondary-foreground": 900,
        "--hx-muted": 100,
        "--hx-muted-foreground": 500,
        "--hx-accent": 100,
        "--hx-accent-foreground": 900,
        "--hx-border": 200,
        "--hx-field": 200,
        "--hx-ring": 400,
    },
    dark: {
        "--hx-background": 950,
        "--hx-foreground": 50,
        "--hx-surface": 900,
        "--hx-surface-foreground": 50,
        "--hx-primary": 200,
        "--hx-primary-foreground": 900,
        "--hx-secondary": 800,
        "--hx-secondary-foreground": 50,
        "--hx-muted": 800,
        "--hx-muted-foreground": 400,
        "--hx-accent": 800,
        "--hx-accent-foreground": 50,
        "--hx-border": "oklch(1 0 0 / 10%)",
        "--hx-field": "oklch(1 0 0 / 15%)",
        "--hx-ring": 500,
    },
};

const accents: Record<string, Record<50 | 500 | 600 | 950, string>> = {
    orange: {
        50: "0.98 0.016 73.684",
        500: "0.705 0.213 47.604",
        600: "0.646 0.222 41.116",
        950: "0.266 0.079 36.259",
    },
    amber: { 50: "0.987 0.022 95.277", 500: "0.769 0.188 70.08", 600: "0.666 0.179 58.318", 950: "0.279 0.077 45.635" },
    yellow: {
        50: "0.987 0.026 102.212",
        500: "0.795 0.184 86.047",
        600: "0.681 0.162 75.834",
        950: "0.286 0.066 53.813",
    },
    lime: {
        50: "0.986 0.031 120.757",
        500: "0.768 0.233 130.85",
        600: "0.648 0.2 131.684",
        950: "0.274 0.072 132.109",
    },
    green: {
        50: "0.982 0.018 155.826",
        500: "0.723 0.219 149.579",
        600: "0.627 0.194 149.214",
        950: "0.266 0.065 152.934",
    },
    emerald: {
        50: "0.979 0.021 166.113",
        500: "0.696 0.17 162.48",
        600: "0.596 0.145 163.225",
        950: "0.262 0.051 172.552",
    },
    teal: { 50: "0.984 0.014 180.72", 500: "0.704 0.14 182.503", 600: "0.6 0.118 184.704", 950: "0.277 0.046 192.524" },
    cyan: {
        50: "0.984 0.019 200.873",
        500: "0.715 0.143 215.221",
        600: "0.609 0.126 221.723",
        950: "0.302 0.056 229.695",
    },
    sky: {
        50: "0.977 0.013 236.62",
        500: "0.685 0.169 237.323",
        600: "0.588 0.158 241.966",
        950: "0.293 0.066 243.157",
    },
    blue: {
        50: "0.97 0.014 254.604",
        500: "0.623 0.214 259.815",
        600: "0.546 0.245 262.881",
        950: "0.282 0.091 267.935",
    },
    indigo: {
        50: "0.962 0.018 272.314",
        500: "0.585 0.233 277.117",
        600: "0.511 0.262 276.966",
        950: "0.257 0.09 281.288",
    },
    violet: {
        50: "0.969 0.016 293.756",
        500: "0.606 0.25 292.717",
        600: "0.541 0.281 293.009",
        950: "0.283 0.141 291.089",
    },
    purple: {
        50: "0.977 0.014 308.299",
        500: "0.627 0.265 303.9",
        600: "0.558 0.288 302.321",
        950: "0.291 0.149 302.717",
    },
    fuchsia: {
        50: "0.977 0.017 320.058",
        500: "0.667 0.295 322.15",
        600: "0.591 0.293 322.896",
        950: "0.293 0.136 325.661",
    },
    pink: { 50: "0.971 0.014 343.198", 500: "0.656 0.241 354.308", 600: "0.592 0.249 0.584", 950: "0.284 0.109 3.907" },
    rose: { 50: "0.969 0.015 12.422", 500: "0.645 0.246 16.439", 600: "0.586 0.253 17.585", 950: "0.271 0.105 12.094" },
};

const fontSizes = {
    small: {
        "--hx-text-sm": "0.75rem",
        "--hx-leading-sm": "calc(1 / 0.75)",
        "--hx-text-base": "0.875rem",
        "--hx-leading-base": "calc(1.25 / 0.875)",
        "--hx-text-lg": "1rem",
        "--hx-leading-lg": "calc(1.5 / 1)",
    },
    medium: {
        "--hx-text-sm": "0.875rem",
        "--hx-leading-sm": "calc(1.25 / 0.875)",
        "--hx-text-base": "1rem",
        "--hx-leading-base": "calc(1.5 / 1)",
        "--hx-text-lg": "1.125rem",
        "--hx-leading-lg": "calc(1.75 / 1.125)",
    },
    large: {
        "--hx-text-sm": "1rem",
        "--hx-leading-sm": "calc(1.5 / 1)",
        "--hx-text-base": "1.125rem",
        "--hx-leading-base": "calc(1.75 / 1.125)",
        "--hx-text-lg": "1.25rem",
        "--hx-leading-lg": "calc(1.75 / 1.25)",
    },
};

function radiusOf(
    control: string,
    field: string,
    option: string,
    panel: string,
    popup: string,
    checkbox: string,
    pill: string,
) {
    return {
        "--hx-radius-control": control,
        "--hx-radius-field": field,
        "--hx-radius-option": option,
        "--hx-radius-panel": panel,
        "--hx-radius-popup": popup,
        "--hx-radius-checkbox": checkbox,
        "--hx-radius-pill": pill,
    };
}

function sizeOf(
    control: string,
    controlSpacing: string,
    field: string,
    fieldSpacing: string,
    option: string,
    optionSpacing: string,
    panelSpacing: string,
) {
    return {
        "--hx-height-control": control,
        "--hx-spacing-control": controlSpacing,
        "--hx-height-field": field,
        "--hx-spacing-field": fieldSpacing,
        "--hx-height-option": option,
        "--hx-spacing-option": optionSpacing,
        "--hx-spacing-panel": panelSpacing,
    };
}

export const tokenPresets: Record<string, Record<string, Record<string, string>>> = {
    radius: {
        square: radiusOf("0rem", "0rem", "0rem", "0rem", "0rem", "0rem", "0rem"),
        default: radiusOf("0.5rem", "0.5rem", "0.25rem", "0.75rem", "0.5rem", "0.375rem", "9999px"),
        soft: radiusOf("0.75rem", "0.75rem", "0.5rem", "1.25rem", "0.75rem", "0.5rem", "0.375rem"),
        pill: radiusOf("9999px", "9999px", "9999px", "1.5rem", "1rem", "0.5rem", "9999px"),
    },
    size: {
        compact: { ...sizeOf("2rem", "0.5rem", "2rem", "0.5rem", "1.75rem", "0.375rem", "1rem"), ...fontSizes.small },
        default: {
            ...sizeOf("2.5rem", "0.75rem", "2.5rem", "0.75rem", "2rem", "0.5rem", "1.25rem"),
            ...fontSizes.medium,
        },
        comfortable: {
            ...sizeOf("3rem", "2rem", "3rem", "1rem", "2.5rem", "0.75rem", "1.5rem"),
            ...fontSizes.large,
        },
    },
    "font-size": fontSizes,
};

export const baseColors = Object.keys(palettes);

export const primaryColors = Object.keys(accents);

export function primaryColorTheme(name: string): Theme {
    const accent = accents[name];
    const resolve = (shade: 500 | 600) => ({
        "--hx-primary": `oklch(${accent[shade]})`,
        "--hx-primary-foreground": `oklch(${accent[parseFloat(accent[shade]) >= 0.64 ? 950 : 50]})`,
    });
    return { light: resolve(600), dark: resolve(500) };
}

export function baseColorTheme(name: string): Theme {
    const palette = palettes[name];
    const resolve = (tokens: Record<string, Shade | string>) =>
        Object.fromEntries(
            Object.entries(tokens).map(([token, shade]) => [
                token,
                typeof shade === "number" ? `oklch(${palette[shade]})` : shade,
            ]),
        );
    return { light: resolve(shades.light), dark: resolve(shades.dark) };
}
