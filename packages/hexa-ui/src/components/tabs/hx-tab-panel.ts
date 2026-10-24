import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HxElement } from "../../hx-element.js";

/**
 * @element hx-tab-panel
 * @property value - Matches the `value` of its `hx-tab`.
 * @slot - The panel content.
 */
@customElement("hx-tab-panel")
export class HxTabPanel extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
                border-radius: var(--hx-radius-control);
                outline: none;
            }
            :host([hidden]) {
                display: none;
            }
            :host(:focus-visible) {
                box-shadow: 0 0 0 3px color-mix(in oklab, var(--hx-ring) 50%, transparent);
            }
        `,
    ];

    @property({ reflect: true }) value = "";

    private internals = this.attachInternals();

    constructor() {
        super();
        this.internals.role = "tabpanel";
    }

    override connectedCallback() {
        super.connectedCallback();
        if (!this.hasAttribute("tabindex")) this.tabIndex = 0;
    }

    override render() {
        return html`<slot></slot>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-tab-panel": HxTabPanel;
    }
}
