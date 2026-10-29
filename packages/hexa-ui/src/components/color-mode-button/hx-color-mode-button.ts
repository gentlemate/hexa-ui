import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Moon, Sun } from "lucide";
import { HxElement } from "../../hx-element.js";
import type { HxButtonVariant } from "../button/hx-button.js";
import "../button/hx-button.js";
import "../icon/hx-icon.js";

export type HxColorMode = "light" | "dark";

const STORAGE_KEY = "hx-color-mode";

/**
 * @element hx-color-mode-button
 * @property variant - Visual style.
 * @fires hx-color-mode-change - The color mode changed; `event.detail.mode` is `"light"` or `"dark"`.
 */
@customElement("hx-color-mode-button")
export class HxColorModeButton extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: inline-flex;
            }
        `,
    ];

    @property({ reflect: true }) variant: HxButtonVariant = "ghost";

    @state() private mode: HxColorMode = "light";

    private observer = new MutationObserver(() => this.syncMode());

    override connectedCallback() {
        super.connectedCallback();
        const stored = readStoredColorMode();
        if (stored) applyColorMode(stored);
        else if (
            !document.documentElement.classList.contains("dark") &&
            matchMedia("(prefers-color-scheme: dark)").matches
        )
            applyColorMode("dark");
        this.syncMode();
        this.observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    }

    override disconnectedCallback() {
        super.disconnectedCallback();
        this.observer.disconnect();
    }

    private syncMode() {
        this.mode = document.documentElement.classList.contains("dark") ? "dark" : "light";
    }

    private toggle() {
        const mode: HxColorMode = this.mode === "dark" ? "light" : "dark";
        applyColorMode(mode);
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch {}
        this.dispatchEvent(
            new CustomEvent("hx-color-mode-change", { detail: { mode }, bubbles: true, composed: true }),
        );
    }

    override render() {
        const label = `Switch to ${this.mode === "dark" ? "light" : "dark"} mode`;
        return html`<hx-button square variant=${this.variant} title=${label} @click=${this.toggle}>
            <hx-icon .icon=${this.mode === "dark" ? Sun : Moon} size="20" label=${label}></hx-icon>
        </hx-button>`;
    }
}

function applyColorMode(mode: HxColorMode) {
    document.documentElement.classList.toggle("dark", mode === "dark");
}

function readStoredColorMode(): HxColorMode | null {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value === "light" || value === "dark" ? value : null;
    } catch {
        return null;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-color-mode-button": HxColorModeButton;
    }
}
