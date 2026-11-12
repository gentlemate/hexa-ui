import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { OuiElement } from "../../oui-element.js";

/**
 * @element oui-tab-panel
 * @property value - Matches the `value` of its `oui-tab`.
 * @slot - The panel content.
 */
@customElement("oui-tab-panel")
export class OuiTabPanel extends OuiElement {
    static override styles = [
        OuiElement.styles,
        css`
            :host {
                display: block;
                border-radius: var(--oui-radius-control);
                outline: none;
            }
            :host([hidden]) {
                display: none;
            }
            :host(:focus-visible) {
                box-shadow: 0 0 0 3px color-mix(in oklab, var(--oui-ring) 50%, transparent);
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
        "oui-tab-panel": OuiTabPanel;
    }
}
