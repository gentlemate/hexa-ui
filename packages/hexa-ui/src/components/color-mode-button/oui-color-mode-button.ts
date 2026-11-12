import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Moon, Sun } from "lucide";
import { OuiElement } from "../../oui-element.js";
import { type OuiColorMode, initColorMode, toggleColorMode } from "../../color-mode.js";
import type { OuiButtonVariant } from "../button/oui-button.js";
import "../button/oui-button.js";
import "../icon/oui-icon.js";

/**
 * @element oui-color-mode-button
 * @property variant - Visual style.
 * @fires oui-color-mode-change - The color mode changed; `event.detail.mode` is `"light"` or `"dark"`.
 */
@customElement("oui-color-mode-button")
export class OuiColorModeButton extends OuiElement {
    static override styles = [
        OuiElement.styles,
        css`
            :host {
                display: inline-flex;
            }
        `,
    ];

    @property({ reflect: true }) variant: OuiButtonVariant = "ghost";

    @state() private mode: OuiColorMode = "light";

    private observer = new MutationObserver(() => this.syncMode());

    override connectedCallback() {
        super.connectedCallback();
        initColorMode();
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
        const mode = toggleColorMode();
        this.dispatchEvent(
            new CustomEvent("oui-color-mode-change", { detail: { mode }, bubbles: true, composed: true }),
        );
    }

    override render() {
        const label = `Switch to ${this.mode === "dark" ? "light" : "dark"} mode`;
        return html`<oui-button square variant=${this.variant} title=${label} @click=${this.toggle}>
            <oui-icon .icon=${this.mode === "dark" ? Sun : Moon} size="20" label=${label}></oui-icon>
        </oui-button>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-color-mode-button": OuiColorModeButton;
    }
}
