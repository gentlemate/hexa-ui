export type OuiColorFormat = "hex" | "rgb" | "hsl" | "oklch";

export interface HsvaColor {
    h: number;
    s: number;
    v: number;
    a: number;
}

type Rgb = [r: number, g: number, b: number];

const hexPattern = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i;
const functionPattern = /^(rgba?|hsla?|oklch)\((.+)\)$/i;
const channelPattern = /^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?)(%)?$/i;

export function clamp(value: number, max = 1) {
    return Math.min(Math.max(value, 0), max);
}

function round(value: number, decimals = 0) {
    return Number(value.toFixed(decimals));
}

function rgbToHsv([r, g, b]: Rgb) {
    const max = Math.max(r, g, b);
    const delta = max - Math.min(r, g, b);
    let h = 0;
    if (delta) {
        if (max === r) h = ((g - b) / delta + 6) % 6;
        else if (max === g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;
    }
    return { h: h * 60, s: max ? delta / max : 0, v: max };
}

function hsvToRgb({ h, s, v }: HsvaColor): Rgb {
    const channel = (n: number) => {
        const k = (n + h / 60) % 6;
        return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    };
    return [channel(5), channel(3), channel(1)];
}

function hslToRgb(h: number, s: number, l: number): Rgb {
    const amplitude = s * Math.min(l, 1 - l);
    const channel = (n: number) => {
        const k = (n + h / 30) % 12;
        return l - amplitude * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return [channel(0), channel(8), channel(4)];
}

function toLinear(channel: number) {
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function fromLinear(channel: number) {
    return channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;
}

function rgbToOklch(rgb: Rgb) {
    const [r, g, b] = rgb.map(toLinear);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const x = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const y = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return {
        l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
        c: Math.hypot(x, y),
        h: ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360,
    };
}

function oklchToRgb(lightness: number, chroma: number, hue: number): Rgb {
    const x = chroma * Math.cos((hue * Math.PI) / 180);
    const y = chroma * Math.sin((hue * Math.PI) / 180);
    const l = (lightness + 0.3963377774 * x + 0.2158037573 * y) ** 3;
    const m = (lightness - 0.1055613458 * x - 0.0638541728 * y) ** 3;
    const s = (lightness - 0.0894841775 * x - 1.291485548 * y) ** 3;
    return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ].map((channel) => clamp(fromLinear(clamp(channel)))) as Rgb;
}

function parseChannel(token: string, percent: number) {
    const match = token.match(channelPattern);
    if (!match) return NaN;
    return Number(match[1]) * (match[2] ? percent / 100 : 1);
}

function parseHue(token: string) {
    const hue = parseChannel(token.replace(/deg$/i, ""), NaN);
    return ((hue % 360) + 360) % 360;
}

function parseHex(hex: string) {
    const digits = hex.length < 6 ? hex.replace(/./g, "$&$&") : hex;
    const [r, g, b, a = 255] = digits.match(/../g)!.map((pair) => parseInt(pair, 16));
    return { ...rgbToHsv([r / 255, g / 255, b / 255]), a: a / 255 };
}

function parseFunction(name: string, args: string) {
    const tokens = args.trim().split(/[\s,/]+/);
    if (tokens.length < 3 || tokens.length > 4) return undefined;
    const [first, second, third, alpha = "1"] = tokens;
    const a = clamp(parseChannel(alpha, 1));
    const rgb: Rgb =
        name === "rgb"
            ? [parseChannel(first, 255) / 255, parseChannel(second, 255) / 255, parseChannel(third, 255) / 255]
            : name === "hsl"
              ? hslToRgb(parseHue(first), clamp(parseChannel(second, 100) / 100), clamp(parseChannel(third, 100) / 100))
              : oklchToRgb(clamp(parseChannel(first, 1)), Math.max(parseChannel(second, 0.4), 0), parseHue(third));
    if ([...rgb, a].some(Number.isNaN)) return undefined;
    return { ...rgbToHsv(rgb.map((channel) => clamp(channel)) as Rgb), a };
}

export function parseColor(value: string): HsvaColor | undefined {
    const text = value.trim();
    const hex = text.match(hexPattern);
    if (hex) return parseHex(hex[1]);
    const [, name, args] = text.match(functionPattern) ?? [];
    return name ? parseFunction(name.toLowerCase().replace(/a$/, ""), args) : undefined;
}

export function formatColor(color: HsvaColor, format: OuiColorFormat, alpha: boolean) {
    const a = alpha ? color.a : 1;
    const opacity = a < 1 ? ` / ${round(a * 100)}%` : "";
    const rgb = hsvToRgb(color);
    switch (format) {
        case "rgb":
            return `rgb(${rgb.map((channel) => round(channel * 255)).join(" ")}${opacity})`;
        case "hsl": {
            const l = color.v * (1 - color.s / 2);
            const s = l === 0 || l === 1 ? 0 : (color.v - l) / Math.min(l, 1 - l);
            return `hsl(${round(color.h)} ${round(s * 100)}% ${round(l * 100)}%${opacity})`;
        }
        case "oklch": {
            const { l, c, h } = rgbToOklch(rgb);
            const chroma = round(c, 4);
            return `oklch(${round(l, 4)} ${chroma} ${chroma ? round(h, 2) : 0}${opacity})`;
        }
        default: {
            const channels = a < 1 ? [...rgb, a] : rgb;
            const hex = channels.map((channel) =>
                round(channel * 255)
                    .toString(16)
                    .padStart(2, "0"),
            );
            return `#${hex.join("")}`;
        }
    }
}
